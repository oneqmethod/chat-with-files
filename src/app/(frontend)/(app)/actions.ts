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

export async function logout(): Promise<never> {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
  redirect('/login')
}
