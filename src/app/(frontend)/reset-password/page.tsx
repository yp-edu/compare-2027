import { AuthCard } from '@/components/auth/auth-card'
import { SiteHeader } from '@/components/layout/site-header'
import { ResetPasswordForm } from '@/features/email/components'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  description: 'Choix d’un nouveau mot de passe pour un compte Compare 2027.',
  noIndex: true,
  path: '/reset-password',
  title: 'Nouveau mot de passe',
})

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string | string[]
    token?: string | string[]
  }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { error, token } = await searchParams
  const authError = Array.isArray(error) ? error[0] : error
  const resetToken = Array.isArray(token) ? token[0] : token

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <AuthCard
        description="Choisissez un nouveau mot de passe pour votre compte Compare 2027."
        footerHref="/forgot-password"
        footerLabel="Demander un nouveau lien"
        footerText="Lien expiré ?"
        title="Nouveau mot de passe"
      >
        <ResetPasswordForm initialError={authError} token={resetToken} />
      </AuthCard>
    </div>
  )
}
