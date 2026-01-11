import Link from 'next/link'
import { MessageSquare, Files, Plus, Upload, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getOptionalUser, getUserChats, getUserFiles } from '@/lib/server'

export default async function DashboardPage() {
  const { payload, user } = await getOptionalUser()

  if (!user) return null

  const [chats, files] = await Promise.all([
    getUserChats(payload, user.id, 5),
    getUserFiles(payload, user.id),
  ])

  const fileStats = {
    total: files.docs.length,
    ready: files.docs.filter((f) => f.status === 'ready').length,
    pending: files.docs.filter((f) => f.status === 'pending' || f.status === 'indexing').length,
    error: files.docs.filter((f) => f.status === 'error').length,
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back{user.displayName ? `, ${user.displayName}` : ''}!
        </h1>
        <p className="mt-2 text-muted-foreground">Chat with your files using AI</p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="h-4 w-4" />
              Chats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chats.totalDocs}</div>
            <p className="text-xs text-muted-foreground">Total conversations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Files className="h-4 w-4" />
              Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {fileStats.ready} ready · {fileStats.pending} processing · {fileStats.error} errors
            </p>
          </CardContent>
        </Card>
      </div>

      {fileStats.ready === 0 && (
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No files ready</AlertTitle>
          <AlertDescription>
            Upload and wait for files to be processed before starting a chat.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-8 flex gap-4">
        {fileStats.ready > 0 ? (
          <Button asChild>
            <Link href="/chat/new">
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Link>
          </Button>
        ) : (
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/files">
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Link>
        </Button>
      </div>

      {chats.docs.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Recent Chats</h2>
          <div className="space-y-2">
            {chats.docs.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{chat.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
