import type { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

const getUser = (req: { user?: unknown }): User | undefined => req.user as User | undefined

export const isAdmin: Access = ({ req }) => getUser(req)?.role === 'admin'

export const isAuthenticated: Access = ({ req }) => !!req.user

export const isAdminOrSelf: Access = ({ req }) => {
  const user = getUser(req)
  if (!user) return false
  if (user.role === 'admin') return true
  return { id: { equals: user.id } }
}

export const isAdminOrOwner: Access = ({ req }) => {
  const user = getUser(req)
  if (!user) return false
  if (user.role === 'admin') return true
  return { user: { equals: user.id } }
}

export const isAdminOrOwnerViaChat: Access = ({ req }) => {
  const user = getUser(req)
  if (!user) return false
  if (user.role === 'admin') return true
  return { 'chat.user': { equals: user.id } }
}

export const adminOnlyField: FieldAccess = ({ req }) => getUser(req)?.role === 'admin'
