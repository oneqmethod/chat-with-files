'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import type { Media } from '@/payload-types'
import type { FileSearchDocument } from '@/lib/gemini'

interface FilesResponse {
  googleDocs: FileSearchDocument[]
  media: Media[]
}

export const UserFilesField = () => {
  const { id } = useDocumentInfo()
  const [data, setData] = useState<FilesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchFiles = async () => {
      try {
        const response = await fetch(`/api/users/${id}/files`)
        if (!response.ok) {
          throw new Error('Failed to fetch files')
        }
        const result = await response.json()
        setData(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch files')
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [id])

  if (!id) {
    return <div style={{ padding: '16px', color: '#666' }}>Save user first to view files</div>
  }

  if (loading) {
    return <div style={{ padding: '16px' }}>Loading files...</div>
  }

  if (error) {
    return <div style={{ padding: '16px', color: '#dc2626' }}>Error: {error}</div>
  }

  const googleDocs = data?.googleDocs || []
  const mediaFiles = data?.media || []

  // Create a map of geminiDocumentId -> media for correlation
  const mediaByGeminiId = new Map<string, Media>()
  mediaFiles.forEach((m) => {
    if (m.geminiDocumentId) {
      mediaByGeminiId.set(m.geminiDocumentId, m)
    }
  })

  // Merge data: start with Google docs and correlate with Media
  const combinedFiles: { googleDoc: FileSearchDocument | null; media: Media | undefined }[] =
    googleDocs.map((doc) => {
      const media = mediaByGeminiId.get(doc.name)
      return {
        googleDoc: doc,
        media,
      }
    })

  // Add media files that don't have a Google doc yet (pending/error states)
  mediaFiles.forEach((m) => {
    if (!m.geminiDocumentId) {
      combinedFiles.push({ googleDoc: null, media: m })
    }
  })

  const formatBytes = (bytes?: string) => {
    if (!bytes) return '-'
    const num = parseInt(bytes, 10)
    if (num < 1024) return `${num} B`
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`
    return `${(num / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const getStateColor = (state?: string) => {
    switch (state) {
      case 'STATE_ACTIVE':
        return '#16a34a'
      case 'STATE_PENDING':
        return '#ca8a04'
      case 'STATE_FAILED':
        return '#dc2626'
      default:
        return '#666'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ready':
        return '#16a34a'
      case 'indexing':
        return '#ca8a04'
      case 'pending':
        return '#3b82f6'
      case 'error':
        return '#dc2626'
      default:
        return '#666'
    }
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
        Google File Store ({combinedFiles.length} files)
      </h4>
      {combinedFiles.length === 0 ? (
        <div
          style={{
            padding: '16px',
            color: '#666',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
          }}
        >
          No files uploaded yet
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 500 }}>Filename</th>
              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 500 }}>Local Status</th>
              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 500 }}>Google State</th>
              <th style={{ textAlign: 'right', padding: '8px', fontWeight: 500 }}>Size</th>
              <th style={{ textAlign: 'left', padding: '8px', fontWeight: 500 }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {combinedFiles.map((file, i) => (
              <tr
                key={file.googleDoc?.name || file.media?.id || i}
                style={{ borderBottom: '1px solid #f0f0f0' }}
              >
                <td style={{ padding: '8px' }}>
                  {file.media?.filename || file.googleDoc?.displayName || '-'}
                </td>
                <td style={{ padding: '8px' }}>
                  <span style={{ color: getStatusColor(file.media?.status) }}>
                    {file.media?.status || '-'}
                  </span>
                </td>
                <td style={{ padding: '8px' }}>
                  <span style={{ color: getStateColor(file.googleDoc?.state) }}>
                    {file.googleDoc?.state?.replace('STATE_', '') || '-'}
                  </span>
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  {formatBytes(file.googleDoc?.sizeBytes)}
                </td>
                <td style={{ padding: '8px' }}>
                  {formatDate(file.googleDoc?.createTime || file.media?.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default UserFilesField
