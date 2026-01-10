import { GoogleGenAI } from '@google/genai'
import fs from 'fs/promises'

let geminiClient: GoogleGenAI | null = null

export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY environment variable is required')
    }
    geminiClient = new GoogleGenAI({ apiKey })
  }
  return geminiClient
}

export async function createFileSearchStore(displayName: string): Promise<string> {
  const ai = getGeminiClient()
  const store = await ai.fileSearchStores.create({
    config: { displayName },
  })
  return store.name!
}

export async function uploadToStore(
  storeId: string,
  file: string | Blob,
  filename: string,
): Promise<string> {
  const ai = getGeminiClient()

  let operation = await ai.fileSearchStores.uploadToFileSearchStore({
    file,
    fileSearchStoreName: storeId,
    config: {
      displayName: filename,
    },
  })

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    operation = await ai.operations.get({ operation })
  }

  if (operation.error) {
    throw new Error(`Upload failed: ${operation.error.message}`)
  }

  return operation.response?.documentName || ''
}

export async function deleteFromStore(documentId: string): Promise<void> {
  const ai = getGeminiClient()
  await ai.fileSearchStores.documents.delete({
    name: documentId,
    config: { force: true },
  })
}

export async function deleteStore(storeId: string): Promise<void> {
  const ai = getGeminiClient()
  await ai.fileSearchStores.delete({
    name: storeId,
    config: { force: true },
  })
}

export async function uploadToStoreFromPath(
  storeId: string,
  filePath: string,
  filename: string,
  mimeType: string,
): Promise<string> {
  const fileBuffer = await fs.readFile(filePath)
  return uploadToStore(storeId, new Blob([fileBuffer], { type: mimeType }), filename)
}

export interface FileSearchDocument {
  name: string
  displayName?: string
  state?: string
  sizeBytes?: string
  createTime?: string
  updateTime?: string
  mimeType?: string
}

export async function listDocumentsInStore(storeId: string): Promise<FileSearchDocument[]> {
  const ai = getGeminiClient()
  const docs: FileSearchDocument[] = []
  const pager = await ai.fileSearchStores.documents.list({ parent: storeId })
  for await (const doc of pager) {
    docs.push(doc as FileSearchDocument)
  }
  return docs
}
