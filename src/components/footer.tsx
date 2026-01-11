'use client'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)]">
      <div className="relative mx-auto max-w-5xl px-4">
        <div className="relative grid grid-cols-1 border-x md:grid-cols-4 md:divide-x">
          <div>
            <SocialCard className="border-t-0" href="https://github.com" title="GitHub" />
            <LinksGroup
              links={[
                { title: 'Features', href: '#features' },
                { title: 'Pricing', href: '#pricing' },
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Files', href: '/files' },
              ]}
              title="Product"
            />
          </div>
          <div>
            <SocialCard href="https://twitter.com" title="Twitter" />
            <LinksGroup
              links={[
                { title: 'Documentation', href: '#' },
                { title: 'API Reference', href: '#' },
                { title: 'Guides', href: '#' },
                { title: 'Blog', href: '#' },
              ]}
              title="Resources"
            />
          </div>

          <div>
            <SocialCard href="https://discord.com" title="Discord" />
            <LinksGroup
              links={[
                { title: 'About Us', href: '#about' },
                { title: 'Contact', href: '#' },
                { title: 'Careers', href: '#' },
                { title: 'Press', href: '#' },
              ]}
              title="Company"
            />
          </div>
          <div>
            <SocialCard href="https://linkedin.com" title="LinkedIn" />
            <LinksGroup
              links={[
                { title: 'Terms of Service', href: '#' },
                { title: 'Privacy Policy', href: '#' },
                { title: 'Cookie Policy', href: '#' },
                { title: 'Security', href: '#' },
              ]}
              title="Legal"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center border-t p-3">
        <p className="text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} Chat with Files. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

type LinksGroupProps = {
  title: string
  links: { title: string; href: string }[]
}
function LinksGroup({ title, links }: LinksGroupProps) {
  return (
    <div className="p-2">
      <h3 className="mt-2 mb-4 font-medium text-foreground/75 text-xs uppercase tracking-wider">
        {title}
      </h3>
      <ul>
        {links.map((link) => (
          <li key={link.title}>
            <a className="text-muted-foreground text-xs hover:text-foreground" href={link.href}>
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialCard({
  title,
  href,
  className,
}: {
  title: string
  href: string
  className?: string
}) {
  return (
    <a
      className={cn(
        'flex items-center justify-between border-y p-2 text-sm hover:bg-accent hover:text-accent-foreground md:border-t-0',
        className,
      )}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="font-medium">{title}</span>
      <ArrowRight className="h-4 w-4 transition-colors" />
    </a>
  )
}
