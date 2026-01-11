'use client'
import Link from 'next/link'
import { useScroll } from '@/hooks/use-scroll'
import { Logo } from '@/components/logo'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MobileNav } from '@/components/mobile-nav'
import type { User } from '@/payload-types'

export const navLinks = [
  {
    label: 'Features',
    href: '#features',
  },
  {
    label: 'Pricing',
    href: '#pricing',
  },
  {
    label: 'About',
    href: '#about',
  },
]

type HeaderProps = {
  user?: User | null
}

export function Header({ user }: HeaderProps) {
  const scrolled = useScroll(10)

  return (
    <header
      className={cn('sticky top-0 z-50 w-full border-transparent border-b', {
        'border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50':
          scrolled,
      })}
    >
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="rounded-md p-2 hover:bg-accent">
          <Logo className="h-4.5" />
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link, i) => (
            <a className={buttonVariants({ variant: 'ghost' })} href={link.href} key={i}>
              {link.label}
            </a>
          ))}
          {user ? (
            <>
              <span className="px-2 text-sm text-muted-foreground">{user.email}</span>
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
        <MobileNav user={user} />
      </nav>
    </header>
  )
}
