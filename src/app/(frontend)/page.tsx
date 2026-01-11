import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'

import { Header } from '@/components/header'
import { Hero } from '@/components/landing/hero'
import { FeatureSection } from '@/components/feature-section'
import { Footer } from '@/components/footer'
import config from '@/payload.config'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header user={user} />
      <main className="flex-1">
        <Hero />
        <section className="py-16 md:py-24">
          <FeatureSection />
        </section>
      </main>
      <Footer />
    </div>
  )
}
