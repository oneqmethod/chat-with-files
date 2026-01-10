import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { UIMessage } from '@ai-sdk/react'
import type { Message as DbMessage } from '@/payload-types'
import { ChatClient } from './ChatClient'

type SourceUrlPart = {
  type: 'source-url'
  sourceId: string
  url: string
  title?: string
}

type SourceDocumentPart = {
  type: 'source-document'
  sourceId: string
  mediaType: string
  title: string
  filename?: string
}

function transformDbMessages(docs: DbMessage[]): UIMessage[] {
  return docs.map((msg) => {
    const parts: Array<{ type: 'text'; text: string } | SourceUrlPart | SourceDocumentPart> = [
      { type: 'text' as const, text: msg.content },
    ]

    if (msg.sources?.length) {
      for (const source of msg.sources) {
        if (source.sourceType === 'url' && source.url) {
          parts.push({
            type: 'source-url' as const,
            sourceId: `${msg.id}-${source.url}`,
            url: source.url,
            title: source.title ?? undefined,
          })
        } else if (source.sourceType === 'document') {
          parts.push({
            type: 'source-document' as const,
            sourceId: `${msg.id}-${source.title || source.filename}`,
            mediaType: 'application/octet-stream',
            title: source.title || source.filename || 'Document',
            filename: source.filename ?? undefined,
          })
        }
      }
    }

    return {
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      parts,
    }
  })
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params
  const isNewChat = id === 'new'
  const chatId = isNewChat ? null : id

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    redirect('/login')
  }

  // Block new chats if no files are ready
  if (isNewChat) {
    const files = await payload.find({
      collection: 'media',
      where: { user: { equals: user.id }, status: { equals: 'ready' } },
      limit: 1,
    })
    if (files.totalDocs === 0) {
      redirect('/files')
    }
  }

  let initialMessages: UIMessage[] = []

  if (!isNewChat && chatId) {
    const { docs } = await payload.find({
      collection: 'messages',
      where: { chat: { equals: chatId } },
      sort: 'createdAt',
      depth: 0,
    })

    initialMessages = transformDbMessages(docs)
  }

  return <ChatClient initialMessages={initialMessages} chatId={chatId} />
}
