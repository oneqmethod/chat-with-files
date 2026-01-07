'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Files,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileUpload, FileUploadDropzone } from '@/components/ui/file-upload'
import type { File as PayloadFile } from '@/payload-types'

interface FilesSidebarProps {
  userId: string
}

interface FileWithStatus extends PayloadFile {
  isLocal?: boolean
}

export function FilesSidebar({ userId }: FilesSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [files, setFiles] = useState<FileWithStatus[]>([])
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
        return <Check className="h-3 w-3 text-green-500" />
      case 'pending':
      case 'indexing':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return null
    }
  }

  if (collapsed) {
    return (
      <div className="flex h-full flex-col border-l bg-muted/30">
        <Button variant="ghost" size="icon" className="m-2" onClick={() => setCollapsed(false)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full w-72 flex-col border-l bg-muted/30">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Files className="h-5 w-5" />
          <h2 className="font-semibold">Files</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(true)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="border-b p-4">
        <FileUpload onUpload={handleUpload} accept=".pdf,.txt,.md,.doc,.docx" multiple>
          <FileUploadDropzone className="min-h-[80px]">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Drop files or click to upload</p>
          </FileUploadDropzone>
        </FileUpload>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : files.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No files uploaded yet</p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                <div className="flex-1 truncate">
                  <p className="truncate font-medium">{file.filename}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getStatusIcon(file.status)}
                    <span className="capitalize">{file.status}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => handleDelete(file.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
