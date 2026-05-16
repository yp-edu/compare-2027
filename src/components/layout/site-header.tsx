'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

const navItems = [{ href: '/compare', label: 'Comparer' }]

function hasAdminAccess(role: unknown) {
  if (Array.isArray(role)) {
    return role.some((value) => value === 'admin' || value === 'editor')
  }

  return role === 'admin' || role === 'editor'
}

export function SiteHeader() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const role = (user as { role?: unknown } | undefined)?.role

  async function handleSignOut() {
    await authClient.signOut()
    router.refresh()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link className="flex items-center gap-3" href="/" aria-label="Accueil Compare 2027">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-sm">
            C27
          </span>
          <span className="text-base font-bold tracking-tight">Compare 2027</span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
            {navItems.map((item) => (
              <Button asChild key={item.href} size="sm" variant="ghost">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            {hasAdminAccess(role) ? (
              <Button asChild size="sm" variant="ghost">
                <Link href="/admin">Admin</Link>
              </Button>
            ) : null}
          </nav>
          {isPending ? (
            <div className="h-9 w-24 rounded-md bg-secondary" aria-hidden="true" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="hidden max-w-36 truncate text-sm font-semibold text-muted-foreground sm:inline">
                {user.name || user.email}
              </span>
              <Button size="sm" variant="outline" onClick={handleSignOut}>
                Déconnexion
              </Button>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link href="/signin">Se connecter</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
