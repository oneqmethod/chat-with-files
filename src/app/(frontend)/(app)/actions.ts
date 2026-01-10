'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function deleteChat(chatId: string) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) throw new Error('Unauthorized')

  const chat = await payload.findByID({ collection: 'chats', id: chatId })
  if ((chat.user as { id: string })?.id !== user.id) {
    throw new Error('Forbidden')
  }

  await payload.delete({ collection: 'chats', id: chatId })
  revalidatePath('/chat')
}

export async function renameChat(chatId: string, newTitle: string) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) throw new Error('Unauthorized')

  const chat = await payload.findByID({ collection: 'chats', id: chatId })
  if ((chat.user as { id: string })?.id !== user.id) {
    throw new Error('Forbidden')
  }

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
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

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
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const media = await payload.findByID({ collection: 'media', id: fileId })
    if ((media.user as { id: string })?.id !== user.id) {
      return { success: false, error: 'Forbidden' }
    }

    await payload.delete({ collection: 'media', id: fileId })
    revalidatePath('/files')
    return { success: true }
  } catch (error) {
    console.error('Delete failed:', error)
    return { success: false, error: 'Delete failed' }
  }
}
