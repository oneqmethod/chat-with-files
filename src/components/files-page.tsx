'use client'

import { useState } from 'react'
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

type FileStatus = 'pending' | 'indexing' | 'ready' | 'error'

interface FilesPageProps {
  files: Media[]
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getStatusIcon(status: FileStatus) {
  switch (status) {
    case 'ready':
      return <Check className="h-4 w-4 text-green-500" />
    case 'pending':
    case 'indexing':
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    default:
      return null
  }
}

interface UploadingFile {
  id: string
  name: string
  size: number
}

export function FilesPage({ files }: FilesPageProps) {
  const router = useRouter()
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])

  async function handleUpload(
    uploadFiles: File[],
    {
      onProgress,
      onSuccess,
      onError,
    }: {
      onProgress: (file: File, progress: number) => void
      onSuccess: (file: File) => void
      onError: (file: File, error: Error) => void
    },
  ) {
    for (const file of uploadFiles) {
      const id = new ObjectId().toHexString()

      // Add temp card immediately with same ID that will be used server-side
      setUploadingFiles((prev) => [...prev, { id, name: file.name, size: file.size }])

      onProgress(file, 10)

      const formData = new FormData()
      formData.append('id', id)
      formData.append('file', file)

      onProgress(file, 30)

      const result = await uploadFile(formData)

      if (result.success) {
        onProgress(file, 100)
        onSuccess(file)
        router.refresh()
      } else {
        // Remove temp card on error
        setUploadingFiles((prev) => prev.filter((f) => f.id !== id))
        onError(file, new Error(result.error || 'Upload failed'))
      }
    }
  }

  async function handleDelete(fileId: string) {
    const result = await deleteFile(fileId)
    if (result.success) {
      router.refresh()
    }
  }

  // Filter out uploading files that already exist in server data
  const pendingUploads = uploadingFiles.filter((u) => !files.some((f) => f.id === u.id))

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

      {files.length === 0 && pendingUploads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No files uploaded yet</p>
          <p className="text-sm text-muted-foreground">Upload documents to chat with them</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pendingUploads.map((file) => (
            <Card key={file.id} className="group relative">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span>Uploading</span>
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {files.map((file) => (
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
                      {getStatusIcon(file.status as FileStatus)}
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
