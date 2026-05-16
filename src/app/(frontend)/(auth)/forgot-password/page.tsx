import { AuthCard } from '@/components/auth/auth-card'
import { SiteHeader } from '@/components/layout/site-header'
import { ForgotPasswordForm } from '@/features/email/components'

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    email?: string | string[]
  }>
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { email } = await searchParams
  const initialEmail = Array.isArray(email) ? email[0] : email

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <AuthCard
        description="Recevez un lien sécurisé pour choisir un nouveau mot de passe. Si votre compte vient de Google, cette étape ajoute aussi une connexion par mot de passe."
        footerHref="/signin"
        footerLabel="Retour à la connexion"
        footerText="Vous connaissez votre mot de passe ?"
        title="Mot de passe oublié"
      >
        <ForgotPasswordForm initialEmail={initialEmail} />
      </AuthCard>
    </div>
  )
}
