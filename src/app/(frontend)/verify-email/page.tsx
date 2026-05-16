import { AuthCard } from '@/components/auth/auth-card'
import { SiteHeader } from '@/components/layout/site-header'
import { VerificationEmailForm } from '@/features/email/components'

type VerifyEmailPageProps = {
  searchParams: Promise<{
    email?: string | string[]
  }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { email } = await searchParams
  const initialEmail = Array.isArray(email) ? email[0] : email

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <AuthCard
        description="Renvoyez un lien de vérification si votre compte e-mail et mot de passe n’est pas encore activé. Les comptes Google vérifiés n’ont pas besoin de cette étape."
        footerHref="/signin"
        footerLabel="Se connecter"
        footerText="Adresse déjà vérifiée ?"
        title="Vérifier mon e-mail"
      >
        <VerificationEmailForm initialEmail={initialEmail} />
      </AuthCard>
    </div>
  )
}
