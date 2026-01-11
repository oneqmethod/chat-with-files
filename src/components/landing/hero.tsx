import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, MessageSquare, Upload } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-24 md:py-32">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.3),transparent)]" />
      </div>

      <div className="mx-auto max-w-5xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-1.5 text-sm backdrop-blur-sm">
          <MessageSquare className="size-4" />
          <span>AI-Powered Document Chat</span>
        </div>

        {/* Headline */}
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Chat with Your Files
          <br />
          <span className="text-muted-foreground">Using AI</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-balance text-muted-foreground md:text-lg">
          Upload your documents, ask questions in natural language, and get instant answers. PDFs,
          Word docs, images — your AI assistant understands them all.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">Learn More</Link>
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-2 rounded-lg border bg-card/50 p-6 backdrop-blur-sm">
            <Upload className="size-8 text-primary" />
            <h3 className="font-medium">Upload Any File</h3>
            <p className="text-sm text-muted-foreground">PDF, DOCX, TXT, images and more</p>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border bg-card/50 p-6 backdrop-blur-sm">
            <MessageSquare className="size-8 text-primary" />
            <h3 className="font-medium">Ask Questions</h3>
            <p className="text-sm text-muted-foreground">Natural language queries</p>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border bg-card/50 p-6 backdrop-blur-sm">
            <FileText className="size-8 text-primary" />
            <h3 className="font-medium">Get Answers</h3>
            <p className="text-sm text-muted-foreground">Instant AI-powered responses</p>
          </div>
        </div>
      </div>
    </section>
  )
}
