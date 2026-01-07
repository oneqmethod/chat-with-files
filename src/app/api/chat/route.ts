import { headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { google } from '@ai-sdk/google'
import { streamText, generateText } from 'ai'

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!user.fileSearchStoreId) {
    return new Response('User file store not initialized', { status: 500 })
  }

  const { messages, chatId } = await request.json()

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

  const lastUserMessage = messages.findLast((m: { role: string }) => m.role === 'user')
  if (lastUserMessage) {
    await payload.create({
      collection: 'messages',
      data: {
        chat: currentChatId,
        role: 'user',
        content: lastUserMessage.content,
      },
    })
  }

  const result = streamText({
    model: google('gemini-2.5-flash'),
    tools: {
      file_search: google.tools.fileSearch({
        fileSearchStoreNames: [user.fileSearchStoreId],
      }),
    },
    messages,
    onFinish: async ({ text, sources }) => {
      await payload.create({
        collection: 'messages',
        data: {
          chat: currentChatId,
          role: 'assistant',
          content: text,
          sources: sources?.map((s) => ({
            filename: s.sourceType === 'url' ? s.url : 'document',
            snippet: 'title' in s ? String(s.title) : undefined,
          })),
        },
      })

      const chat = await payload.findByID({
        collection: 'chats',
        id: currentChatId,
      })

      if (chat.title === 'New Chat' && messages.length <= 2) {
        const { text: title } = await generateText({
          model: google('gemini-2.5-flash'),
          prompt: `Generate a short (3-5 words) chat title for this conversation. Only output the title, nothing else.\n\nUser: ${lastUserMessage?.content}`,
        })

        await payload.update({
          collection: 'chats',
          id: currentChatId,
          data: { title: title.trim().slice(0, 100) },
        })
      }
    },
  })

  return result.toTextStreamResponse({
    headers: { 'X-Chat-Id': currentChatId },
  })
}
