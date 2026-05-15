import Link from 'next/link'

import { Button } from '@/components/ui/button'

const navItems = [
  { href: '#comparaison', label: 'Comparer' },
  { href: '#methode', label: 'Méthode' },
  { href: '/admin', label: 'Admin' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link className="flex items-center gap-3" href="/" aria-label="Accueil Compare 2027">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-sm">
            C27
          </span>
          <span className="text-base font-bold tracking-tight">Compare 2027</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {navItems.map((item) => (
            <Button asChild key={item.href} size="sm" variant="ghost">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  )
}
