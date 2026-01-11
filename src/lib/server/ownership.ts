export function getUserIdFromResource(resource: { user: string | { id: string } }): string {
  return typeof resource.user === 'string' ? resource.user : resource.user.id
}

export function verifyOwnership(resource: { user: string | { id: string } }, userId: string): void {
  if (getUserIdFromResource(resource) !== userId) {
    throw new Error('Forbidden')
  }
}
