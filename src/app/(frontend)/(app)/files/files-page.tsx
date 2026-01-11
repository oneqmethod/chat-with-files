'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ObjectId } from 'bson'
import { Upload, X, Check, Loader2, AlertCircle, FileText, Trash2 } from 'lucide-react'
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

interface PendingFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'error'
  error?: string
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
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setCurrentFiles(files)
  }, [files])

  function handleFilesAccepted(acceptedFiles: File[]) {
    const newPending = acceptedFiles.map((file) => ({
      id: new ObjectId().toHexString(),
      file,
      status: 'pending' as const,
    }))
    setPendingFiles((prev) => [...prev, ...newPending])
  }

  function removePendingFile(id: string) {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id))
  }

  function clearPendingFiles() {
    setPendingFiles([])
  }

  async function handleUpload() {
    if (pendingFiles.length === 0 || isUploading) return

    setIsUploading(true)

    // Mark all as uploading
    setPendingFiles((prev) => prev.map((f) => ({ ...f, status: 'uploading' as const })))

    const results = await Promise.allSettled(
      pendingFiles.map(async (pending) => {
        const formData = new FormData()
        formData.append('id', pending.id)
        formData.append('file', pending.file)
        formData.append('createdAt', Date.now().toString())

        const result = await uploadFile(formData)

        if (!result.success) {
          throw new Error(result.error || 'Upload failed')
        }

        return pending.id
      }),
    )

    // Process results - remove successful, mark errors
    const successIds = new Set<string>()
    const errors = new Map<string, string>()

    results.forEach((result, index) => {
      const pending = pendingFiles[index]
      if (result.status === 'fulfilled') {
        successIds.add(pending.id)
      } else {
        errors.set(pending.id, result.reason?.message || 'Upload failed')
      }
    })

    setPendingFiles((prev) =>
      prev
        .filter((f) => !successIds.has(f.id))
        .map((f) =>
          errors.has(f.id) ? { ...f, status: 'error' as const, error: errors.get(f.id) } : f,
        ),
    )

    setIsUploading(false)
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

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Files</h1>
        <p className="text-muted-foreground">Upload and manage your documents</p>
      </div>

      {/* Dropzone */}
      <div className="mb-6">
        <FileUpload onAccept={handleFilesAccepted} accept={ACCEPTED_FILE_TYPES} multiple>
          <FileUploadDropzone className="min-h-[120px]">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drop files here or click to select</p>
            <p className="text-xs text-muted-foreground">Supports {ACCEPTED_FILE_TYPES_DISPLAY}</p>
          </FileUploadDropzone>
        </FileUpload>
      </div>

      {/* Pending files list */}
      {pendingFiles.length > 0 && (
        <div className="mb-8 rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">
              {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''} selected
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clearPendingFiles} disabled={isUploading}>
                <Trash2 className="mr-1 h-4 w-4" />
                Clear
              </Button>
              <Button size="sm" onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {pendingFiles.map((pending) => (
              <div
                key={pending.id}
                className="flex items-center gap-3 rounded-md border bg-background p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{pending.file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {pending.status === 'uploading' ? (
                      <span className="flex items-center gap-1 text-blue-500">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Uploading
                      </span>
                    ) : pending.status === 'error' ? (
                      <span className="flex items-center gap-1 text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        {pending.error || 'Failed'}
                      </span>
                    ) : (
                      <span>{formatFileSize(pending.file.size)}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => removePendingFile(pending.id)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded files grid */}
      {currentFiles.length === 0 && pendingFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No files uploaded yet</p>
          <p className="text-sm text-muted-foreground">Upload documents to chat with them</p>
        </div>
      ) : currentFiles.length > 0 ? (
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
      ) : null}
    </div>
  )
}
