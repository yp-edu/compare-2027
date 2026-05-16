import { AuthCard } from '@/components/auth/auth-card'
import { AuthForm } from '@/components/auth/auth-form'
import { SiteHeader } from '@/components/layout/site-header'

type SignUpPageProps = {
  searchParams: Promise<{
    error?: string | string[]
  }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { error } = await searchParams
  const enableGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  const authError = Array.isArray(error) ? error[0] : error

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <AuthCard
        description="Créez un compte utilisateur pour accéder au chat comparatif hors de l’admin."
        footerHref="/signin"
        footerLabel="Se connecter"
        footerText="Déjà inscrit ?"
        title="Créer un compte"
      >
        <AuthForm enableGoogle={enableGoogle} initialError={authError} mode="signup" />
      </AuthCard>
    </div>
  )
}
