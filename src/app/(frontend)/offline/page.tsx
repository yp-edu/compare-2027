import Link from 'next/link'
import { WifiOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SiteHeader } from '@/components/layout/site-header'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-5 py-12 sm:px-8">
        <Card className="w-full max-w-xl border-primary/15 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <WifiOff className="size-7" aria-hidden="true" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight">Vous êtes hors ligne</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-base leading-7 text-muted-foreground">
              Les pages déjà consultées peuvent rester accessibles. Le chat comparatif, la connexion
              et les actions de compte nécessitent une connexion Internet.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg">
                <Link href="/">Retour à l’accueil</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/compare">Voir le comparateur</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
