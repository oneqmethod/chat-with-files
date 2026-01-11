'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedUser, verifyOwnership } from '@/lib/server'

export async function deleteChat(chatId: string): Promise<void> {
  const { payload, user } = await getAuthenticatedUser()

  const chat = await payload.findByID({ collection: 'chats', id: chatId })
  verifyOwnership(chat, user.id)

  await payload.delete({ collection: 'chats', id: chatId })
  revalidatePath('/chat')
}

export async function renameChat(chatId: string, newTitle: string): Promise<void> {
  const { payload, user } = await getAuthenticatedUser()

  const chat = await payload.findByID({ collection: 'chats', id: chatId })
  verifyOwnership(chat, user.id)

  await payload.update({ collection: 'chats', id: chatId, data: { title: newTitle } })
  revalidatePath('/chat')
}

export async function logout(): Promise<never> {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
  redirect('/login')
}

export async function uploadFile(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const { payload, user } = await getAuthenticatedUser()

  const id = formData.get('id') as string | undefined
  const file = formData.get('file') as File | null
  const createdAt = formData.get('createdAt') as string | undefined

  if (!file) {
    return { success: false, error: 'No file provided' }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    await payload.create({
      collection: 'media',
      data: {
        id,
        createdAt,
        user: user.id,
        status: 'pending',
      },
      file: {
        data: buffer,
        name: file.name,
        mimetype: file.type,
        size: file.size,
      },
    })

    revalidatePath('/files')
    return { success: true }
  } catch (error) {
    console.error('Upload failed:', error)
    return { success: false, error: 'Upload failed' }
  }
}

export async function deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
  const { payload, user } = await getAuthenticatedUser()

  try {
    const media = await payload.findByID({ collection: 'media', id: fileId })
    verifyOwnership(media, user.id)

    await payload.delete({ collection: 'media', id: fileId })
    revalidatePath('/files')
    return { success: true }
  } catch (error) {
    console.error('Delete failed:', error)
    return { success: false, error: 'Delete failed' }
  }
}
