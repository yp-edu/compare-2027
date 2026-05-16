import { AuthCard } from '@/components/auth/auth-card'
import { AuthForm } from '@/components/auth/auth-form'
import { SiteHeader } from '@/components/layout/site-header'

export default function SignUpPage() {
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
        <AuthForm mode="signup" />
      </AuthCard>
    </div>
  )
}
