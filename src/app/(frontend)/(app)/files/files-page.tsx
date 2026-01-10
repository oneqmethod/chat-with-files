'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ObjectId } from 'bson'
import { Upload, X, Check, Loader2, AlertCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileUpload, FileUploadDropzone } from '@/components/ui/file-upload'
import { uploadFile, deleteFile } from '@/app/(frontend)/(app)/actions'
import type { Media } from '@/payload-types'

const ACCEPTED_FILE_TYPES = '.pdf,.txt,.md,.doc,.docx'
const ACCEPTED_FILE_TYPES_DISPLAY = 'PDF, TXT, MD, DOC, DOCX'

interface FilesPageProps {
  files: Media[]
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getStatusIcon(status: Media['status'] | 'deleting' = 'pending') {
  switch (status) {
    case 'ready':
      return <Check className="h-4 w-4 text-green-500" />
    case 'pending':
    case 'deleting':
    case 'indexing':
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    default:
      return null
  }
}

export function FilesPage({ files = [] }: FilesPageProps) {
  const router = useRouter()
  const [currentFiles, setCurrentFiles] = useState<Media[]>([])

  useEffect(() => {
    setCurrentFiles(files)
  }, [files])

  async function handleUpload(
    uploadFiles: File[],
    {
      onSuccess,
      onError,
    }: {
      onProgress: (file: File, progress: number) => void
      onSuccess: (file: File) => void
      onError: (file: File, error: Error) => void
    },
  ) {
    await Promise.all(
      uploadFiles.map(async (file) => {
        const id = new ObjectId().toHexString()

        // Add temp card immediately with same ID that will be used server-side
        setCurrentFiles((prev) => [
          ...prev,
          {
            id,
            filename: file.name,
            filesize: file.size,
            status: 'pending',
            createdAt: '',
            updatedAt: '',
            user: '',
          },
        ])

        const formData = new FormData()
        formData.append('id', id)
        formData.append('file', file)
        formData.append('createdAt', Date.now().toString())

        const result = await uploadFile(formData)

        if (result.success) {
          onSuccess(file)
          router.refresh()
        } else {
          // Remove temp card on error
          setCurrentFiles((prev) => prev.filter((f) => f.id !== id))
          onError(file, new Error(result.error || 'Upload failed'))
        }
      }),
    )

    router.refresh()
  }

  async function handleDelete(fileId: string) {
    setCurrentFiles((prev) => {
      const files = [...prev]

      const file = files.find((f) => f.id === fileId)
      if (!file) return files
      file.status = 'deleting' as any
      return files
    })

    const result = await deleteFile(fileId)

    if (result.success) {
      router.refresh()
    }
  }

  // Filter out uploading files that already exist in server data
  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Files</h1>
        <p className="text-muted-foreground">Upload and manage your documents</p>
      </div>

      <div className="mb-8">
        <FileUpload onUpload={handleUpload} accept={ACCEPTED_FILE_TYPES} multiple>
          <FileUploadDropzone className="min-h-[120px]">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
            <p className="text-xs text-muted-foreground">Supports {ACCEPTED_FILE_TYPES_DISPLAY}</p>
          </FileUploadDropzone>
        </FileUpload>
      </div>

      {currentFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No files uploaded yet</p>
          <p className="text-sm text-muted-foreground">Upload documents to chat with them</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentFiles.map((file) => (
            <Card key={file.id} className="group relative">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium" title={file.filename || 'Unknown'}>
                    {file.filename || 'Unknown'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {getStatusIcon(file.status)}
                      <span className="capitalize">{file.status}</span>
                    </span>
                    {file.filesize && (
                      <>
                        <span>•</span>
                        <span>{formatFileSize(file.filesize)}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleDelete(file.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
