import { LegalPage } from '@/components/legal/legal-page'
import { GITHUB_REPOSITORY_URL } from '@/lib/legal'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  description:
    'Conditions générales d’utilisation de Compare 2027: objet du service, compte utilisateur, usages autorisés et licence.',
  path: '/cgu',
  title: 'Conditions générales d’utilisation',
})

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Légal" title="Conditions générales d’utilisation">
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Objet du service</h2>
        <p>
          Compare 2027 aide à comparer des programmes, candidats, partis et positions publiques à
          partir de contenus éditoriaux et de sources identifiées. Le service n’est pas un conseil
          de vote et ne remplace pas la consultation directe des sources officielles.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Compte utilisateur</h2>
        <p>
          Le chat comparatif nécessite un compte avec une adresse e-mail vérifiée et l’acceptation
          des CGU, de la politique de confidentialité et de la charte de neutralité. Vous êtes
          responsable de la confidentialité de vos moyens de connexion.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Usage autorisé</h2>
        <p>
          Le service doit être utilisé pour s’informer, comparer et vérifier. Les tentatives d’accès
          non autorisé, de saturation, d’extraction massive abusive ou de détournement du service
          sont interdites.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Licence</h2>
        <p>
          Le code source de Compare 2027 est publié sous licence MIT sur{' '}
          <a
            className="font-semibold text-primary underline-offset-4 hover:underline"
            href={GITHUB_REPOSITORY_URL}
          >
            GitHub
          </a>
          . Les contenus éditoriaux, la marque et les éléments d’identité du projet restent
          protégés.
        </p>
      </section>
    </LegalPage>
  )
}
