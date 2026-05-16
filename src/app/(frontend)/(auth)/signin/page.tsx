import { AuthCard } from '@/components/auth/auth-card'
import { AuthForm } from '@/components/auth/auth-form'
import { SiteHeader } from '@/components/layout/site-header'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  description: 'Connexion à un compte Compare 2027.',
  noIndex: true,
  path: '/signin',
  title: 'Connexion',
})

type SignInPageProps = {
  searchParams: Promise<{
    error?: string | string[]
  }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error } = await searchParams
  const enableGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  const authError = Array.isArray(error) ? error[0] : error

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <AuthCard
        description="Connectez-vous pour ouvrir le comparateur et poser vos questions sur les programmes."
        footerHref="/signup"
        footerLabel="Créer un compte"
        footerText="Pas encore inscrit ?"
        title="Connexion"
      >
        <AuthForm enableGoogle={enableGoogle} initialError={authError} mode="signin" />
      </AuthCard>
    </div>
  )
}
