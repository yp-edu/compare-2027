import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayloadAuth } from 'payload-auth/better-auth'

import { LegalConsentForm } from '@/components/auth/legal-consent-form'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isLegalConsentCurrent } from '@/lib/legal'
import type { ConstructedBetterAuthPluginOptions } from '@/plugins/auth'

type ConsentPageProps = {
  searchParams: Promise<{
    next?: string | string[]
  }>
}

function getSafeNextPath(value?: string | string[]) {
  const nextPath = Array.isArray(value) ? value[0] : value

  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return '/compare'
  }

  return nextPath
}

export default async function ConsentPage({ searchParams }: ConsentPageProps) {
  const { next } = await searchParams
  const nextPath = getSafeNextPath(next)
  const payload = await getPayloadAuth<ConstructedBetterAuthPluginOptions>(config)
  const session = await payload.betterAuth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect(`/signin?${new URLSearchParams({ error: 'authentication_required' }).toString()}`)
  }

  if (isLegalConsentCurrent(session.user)) {
    redirect(nextPath)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-5 py-12 sm:px-8">
        <Card className="w-full max-w-lg border-primary/15 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
          <CardHeader className="space-y-3 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">
              Confirmation du compte
            </p>
            <CardTitle className="text-3xl font-black tracking-tight">
              Validez les conditions avant de comparer.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-sm font-semibold text-muted-foreground">
                Informations de profil récupérées
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-sm font-black text-secondary-foreground">
                  C27
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {session.user.name || 'Compte utilisateur'}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{session.user.email}</p>
                </div>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Compare 2027 enregistrera la date, la version acceptée, les fournisseurs de connexion
              et une empreinte sécurisée de votre adresse IP, sans stocker l’adresse IP brute.
            </p>
            <LegalConsentForm nextPath={nextPath} />
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  )
}
