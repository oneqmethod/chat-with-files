import type { CollectionAfterChangeHook } from 'payload'

export const queueGoogleUpload: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create' || !doc.filename || !doc.user) return doc

  await req.payload.jobs.queue({
    task: 'uploadToGoogle',
    input: {
      mediaId: doc.id,
      userId: typeof doc.user === 'string' ? doc.user : doc.user.id,
    },
  })

  // Run queued jobs immediately instead of waiting for autoRun
  await req.payload.jobs.run()

  return doc
}
