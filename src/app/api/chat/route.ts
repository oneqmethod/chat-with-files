import { headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createGoogleGenerativeAI, type GoogleGenerativeAIProviderOptions } from '@ai-sdk/google'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
})
import { streamText, generateText, convertToModelMessages, type UIMessage } from 'ai'

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!user.fileSearchStoreId) {
    return new Response('User file store not initialized', { status: 500 })
  }

  const { messages, chatId }: { messages: UIMessage[]; chatId?: string } = await request.json()

  let currentChatId = chatId

  if (!currentChatId) {
    const chat = await payload.create({
      collection: 'chats',
      data: {
        user: user.id,
        title: 'New Chat',
      },
    })
    currentChatId = chat.id
  }

  // Extract text from last user message (UIMessage format has parts array)
  const lastUserMessage = messages.findLast((m) => m.role === 'user')
  const lastUserText = lastUserMessage?.parts
    ?.filter((p) => p.type === 'text')
    .map((p) => (p as { type: 'text'; text: string }).text)
    .join('\n')

  if (lastUserText) {
    await payload.create({
      collection: 'messages',
      data: {
        chat: currentChatId,
        role: 'user',
        content: lastUserText,
      },
    })
  }

  // Convert UI messages to model format for streamText
  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: google('gemini-3-flash-preview'),
    system: `You are a helpful assistant that answers questions based on the user's uploaded files.
Always use the file_search tool to find relevant information before answering.
When you find information, cite your sources.`,
    tools: {
      file_search: google.tools.fileSearch({
        fileSearchStoreNames: [user.fileSearchStoreId],
      }),
    },
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingLevel: 'low',
          includeThoughts: true,
        },
      } satisfies GoogleGenerativeAIProviderOptions,
    },
    messages: modelMessages,
    onFinish: async ({ text, sources }) => {
      await payload.create({
        collection: 'messages',
        data: {
          chat: currentChatId,
          role: 'assistant',
          content: text,
          sources: sources?.map((s) => ({
            sourceType: s.sourceType === 'url' ? 'url' : 'document',
            url: s.sourceType === 'url' ? s.url : undefined,
            title: 'title' in s ? String(s.title) : undefined,
            filename: 'filename' in s ? String(s.filename) : undefined,
          })),
        },
      })

      const chat = await payload.findByID({
        collection: 'chats',
        id: currentChatId,
      })

      if (chat.title === 'New Chat' && messages.length <= 2 && lastUserText) {
        const { text: title } = await generateText({
          model: google('gemini-2.5-flash'),
          prompt: `Generate a short (3-5 words) chat title for this conversation. Only output the title, nothing else.\n\nUser: ${lastUserText}`,
        })

        await payload.update({
          collection: 'chats',
          id: currentChatId,
          data: { title: title.trim().slice(0, 100) },
        })
      }
    },
  })

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
    headers: { 'X-Chat-Id': currentChatId },
  })
}
