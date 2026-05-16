import { AuthCard } from '@/components/auth/auth-card'
import { SiteHeader } from '@/components/layout/site-header'
import { VerificationEmailForm } from '@/features/email/components'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  description: 'Vérification d’adresse e-mail pour un compte Compare 2027.',
  noIndex: true,
  path: '/verify-email',
  title: 'Vérifier mon e-mail',
})

type VerifyEmailPageProps = {
  searchParams: Promise<{
    created?: string | string[]
    email?: string | string[]
  }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { created, email } = await searchParams
  const wasCreated = (Array.isArray(created) ? created[0] : created) === '1'
  const initialEmail = Array.isArray(email) ? email[0] : email
  const createdMessage =
    'Votre compte a été créé. Vérifiez votre boîte e-mail pour activer l’accès au comparateur.'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <AuthCard
        description={
          wasCreated
            ? 'Un e-mail de vérification vient d’être envoyé à l’adresse utilisée lors de l’inscription.'
            : 'Renvoyez un lien de vérification si votre compte e-mail et mot de passe n’est pas encore activé. Les comptes Google vérifiés n’ont pas besoin de cette étape.'
        }
        footerHref="/signin"
        footerLabel="Se connecter"
        footerText="Adresse déjà vérifiée ?"
        title={wasCreated ? 'Vérifiez votre boîte e-mail' : 'Vérifier mon e-mail'}
      >
        <VerificationEmailForm
          initialEmail={initialEmail}
          initialSuccessMessage={wasCreated ? createdMessage : undefined}
        />
      </AuthCard>
    </div>
  )
}
