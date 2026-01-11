import type { PaginatedDocs } from 'payload'
import type { Chat, Media, Message } from '@/payload-types'
import { getPayload } from 'payload'

type PayloadInstance = Awaited<ReturnType<typeof getPayload>>

export async function getUserChats(
  payload: PayloadInstance,
  userId: string,
  limit = 50,
): Promise<PaginatedDocs<Chat>> {
  const result = await payload.find({
    collection: 'chats',
    where: { user: { equals: userId } },
    sort: '-updatedAt',
    limit,
  })
  return result as PaginatedDocs<Chat>
}

export async function getUserFiles(
  payload: PayloadInstance,
  userId: string,
  status?: Media['status'],
): Promise<PaginatedDocs<Media>> {
  const result = await payload.find({
    collection: 'media',
    where: status
      ? { user: { equals: userId }, status: { equals: status } }
      : { user: { equals: userId } },
    sort: '-createdAt',
  })
  return result as PaginatedDocs<Media>
}

export async function getChatMessages(
  payload: PayloadInstance,
  chatId: string,
): Promise<PaginatedDocs<Message>> {
  const result = await payload.find({
    collection: 'messages',
    where: { chat: { equals: chatId } },
    sort: 'createdAt',
    depth: 0,
  })
  return result as PaginatedDocs<Message>
}

export async function userHasReadyFiles(
  payload: PayloadInstance,
  userId: string,
): Promise<boolean> {
  const files = await payload.find({
    collection: 'media',
    where: { user: { equals: userId }, status: { equals: 'ready' } },
    limit: 1,
  })
  return files.totalDocs > 0
}
