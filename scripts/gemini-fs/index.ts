#!/usr/bin/env node
import 'dotenv/config'
import meow from 'meow'
import { GoogleGenAI } from '@google/genai'

const cli = meow(
  `
  Usage
    $ gemini-fs <command> [options]

  Commands
    list-stores              List all file search stores
    create-store <name>      Create a new store
    delete-store <id>        Delete a store
    list-files <store-id>    List documents in a store
    delete-file <doc-id>     Delete a document

  Examples
    $ gemini-fs list-stores
    $ gemini-fs create-store "My Documents"
    $ gemini-fs delete-store fileSearchStores/abc123
    $ gemini-fs list-files fileSearchStores/abc123
    $ gemini-fs delete-file fileSearchStores/abc123/documents/xyz789
`,
  {
    importMeta: import.meta,
    flags: {},
  },
)

function getClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    console.error('Error: GOOGLE_GEMINI_API_KEY environment variable is required')
    process.exit(1)
  }
  return new GoogleGenAI({ apiKey })
}

async function listStores(): Promise<void> {
  const ai = getClient()
  const pager = await ai.fileSearchStores.list()
  let count = 0
  for await (const store of pager) {
    console.log(`${store.name} - ${store.displayName || '(no name)'}`)
    count++
  }
  if (count === 0) {
    console.log('No stores found')
  }
}

async function createStore(name: string): Promise<void> {
  const ai = getClient()
  const store = await ai.fileSearchStores.create({
    config: { displayName: name },
  })
  console.log(`Created store: ${store.name}`)
}

async function deleteStore(id: string): Promise<void> {
  const ai = getClient()
  await ai.fileSearchStores.delete({
    name: id,
    config: { force: true },
  })
  console.log(`Deleted store: ${id}`)
}

async function listFiles(storeId: string): Promise<void> {
  const ai = getClient()
  const pager = await ai.fileSearchStores.documents.list({ parent: storeId })
  let count = 0
  for await (const doc of pager) {
    console.log(`${doc.name}`)
    console.log(`  Display Name: ${doc.displayName || '(none)'}`)
    console.log(`  State: ${doc.state || 'unknown'}`)
    console.log(`  Size: ${doc.sizeBytes || 'unknown'} bytes`)
    console.log(`  MIME Type: ${doc.mimeType || 'unknown'}`)
    console.log()
    count++
  }
  if (count === 0) {
    console.log('No documents found in store')
  }
}

async function deleteFile(docId: string): Promise<void> {
  const ai = getClient()
  await ai.fileSearchStores.documents.delete({ name: docId, config: { force: true} })
  console.log(`Deleted document: ${docId}`)
}

async function main(): Promise<void> {
  const [command, ...args] = cli.input

  if (!command) {
    cli.showHelp(0)
    return
  }

  try {
    switch (command) {
      case 'list-stores':
        await listStores()
        break

      case 'create-store':
        if (!args[0]) {
          console.error('Error: Store name is required')
          console.error('Usage: gemini-fs create-store <name>')
          process.exit(1)
        }
        await createStore(args[0])
        break

      case 'delete-store':
        if (!args[0]) {
          console.error('Error: Store ID is required')
          console.error('Usage: gemini-fs delete-store <id>')
          process.exit(1)
        }
        await deleteStore(args[0])
        break

      case 'list-files':
        if (!args[0]) {
          console.error('Error: Store ID is required')
          console.error('Usage: gemini-fs list-files <store-id>')
          process.exit(1)
        }
        await listFiles(args[0])
        break

      case 'delete-file':
        if (!args[0]) {
          console.error('Error: Document ID is required')
          console.error('Usage: gemini-fs delete-file <doc-id>')
          process.exit(1)
        }
        await deleteFile(args[0])
        break

      default:
        console.error(`Unknown command: ${command}`)
        cli.showHelp()
        process.exit(1)
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
