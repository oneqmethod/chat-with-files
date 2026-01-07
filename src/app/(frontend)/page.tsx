import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import config from '@/payload.config'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Image
            alt="Payload Logo"
            height={65}
            src="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg"
            width={65}
            className="mb-4 m-auto"
          />
          <CardTitle className="text-2xl">
            {user ? `Welcome back, ${user.email}` : 'Welcome to your new project.'}
          </CardTitle>
          <CardDescription>Get started by exploring the admin panel or docs.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild>
            <a href={payloadConfig.routes.admin} rel="noopener noreferrer" target="_blank">
              Go to admin panel
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://payloadcms.com/docs" rel="noopener noreferrer" target="_blank">
              Documentation
            </a>
          </Button>
        </CardContent>
      </Card>

      <p className="mt-8 text-sm text-muted-foreground">
        Update this page by editing{' '}
        <a href={fileURL} className="font-mono text-foreground underline underline-offset-4">
          app/(frontend)/page.tsx
        </a>
      </p>
    </div>
  )
}
