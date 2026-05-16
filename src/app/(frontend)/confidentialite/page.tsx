import { LegalPage } from '@/components/legal/legal-page'

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Confidentialité" title="Politique de confidentialité">
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Données de compte</h2>
        <p>
          Compare 2027 traite les informations nécessaires à l’authentification : nom affiché,
          adresse e-mail, statut de vérification, image de profil lorsque Google la fournit,
          sessions actives et fournisseurs de connexion associés au compte.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Consentement légal</h2>
        <p>
          Lors de l’acceptation des documents légaux, Compare 2027 enregistre la date, la version
          acceptée, les fournisseurs de connexion et l’agent utilisateur. L’adresse IP utilisée pour
          ce journal est transformée en empreinte cryptographique avec un sel serveur ; l’adresse IP
          brute n’est pas stockée dans ce journal de consentement.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Sécurité et mesure d’audience</h2>
        <p>
          Les sessions d’authentification peuvent conserver des métadonnées techniques comme
          l’adresse IP et l’agent utilisateur pour la sécurité du compte. Le site utilise également
          les outils Vercel Analytics et Speed Insights pour mesurer l’usage et la performance du
          service.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Vos droits</h2>
        <p>
          Vous pouvez demander l’accès, la rectification ou la suppression des données liées à votre
          compte. Une demande peut être traitée après vérification raisonnable de l’identité du
          compte concerné.
        </p>
      </section>
    </LegalPage>
  )
}
