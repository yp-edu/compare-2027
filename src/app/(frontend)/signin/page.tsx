import { AuthCard } from '@/components/auth/auth-card'
import { AuthForm } from '@/components/auth/auth-form'
import { SiteHeader } from '@/components/layout/site-header'

export default function SignInPage() {
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
        <AuthForm mode="signin" />
      </AuthCard>
    </div>
  )
}
