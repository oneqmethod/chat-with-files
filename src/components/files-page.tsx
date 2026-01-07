'use client'

import { useState, useEffect, useCallback } from 'react'
import { Upload, X, Check, Loader2, AlertCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileUpload, FileUploadDropzone } from '@/components/ui/file-upload'
import type { File as PayloadFile } from '@/payload-types'

interface FilesPageProps {
  userId: string
}

export function FilesPage({ userId }: FilesPageProps) {
  const [files, setFiles] = useState<PayloadFile[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch('/api/files?limit=100')
      if (res.ok) {
        const data = await res.json()
        setFiles(data.docs || [])
      }
    } catch (error) {
      console.error('Failed to fetch files:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

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
      try {
        onProgress(file, 10)

        const formData = new FormData()
        formData.append('file', file)

        onProgress(file, 30)

        const res = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        onProgress(file, 70)

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Upload failed')
        }

        onProgress(file, 100)
        onSuccess(file)

        fetchFiles()
      } catch (error) {
        onError(file, error instanceof Error ? error : new Error('Upload failed'))
      }
    }
  }

  async function handleDelete(fileId: string) {
    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId))
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }

  function getStatusIcon(status: PayloadFile['status']) {
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

  function formatFileSize(bytes: number | null | undefined): string {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Files</h1>
        <p className="text-muted-foreground">Upload and manage your documents</p>
      </div>

      <div className="mb-8">
        <FileUpload onUpload={handleUpload} accept=".pdf,.txt,.md,.doc,.docx" multiple>
          <FileUploadDropzone className="min-h-[120px]">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
            <p className="text-xs text-muted-foreground">Supports PDF, TXT, MD, DOC, DOCX</p>
          </FileUploadDropzone>
        </FileUpload>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No files uploaded yet</p>
          <p className="text-sm text-muted-foreground">Upload documents to chat with them</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <Card key={file.id} className="group relative">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium" title={file.filename}>
                    {file.filename}
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
