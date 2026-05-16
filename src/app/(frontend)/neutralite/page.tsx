import { LegalPage } from '@/components/legal/legal-page'

export default function NeutralityPage() {
  return (
    <LegalPage eyebrow="Neutralité" title="Charte de neutralité">
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Principe</h2>
        <p>
          Compare 2027 cherche à rendre les différences politiques lisibles sans recommander un
          candidat, un parti ou une orientation politique. La neutralité signifie expliciter la
          méthode, les sources et les limites, pas effacer les désaccords.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Sources</h2>
        <p>
          Les réponses doivent distinguer les faits publics, les résumés et l’analyse. Quand les
          données disponibles sont insuffisantes ou non sourcées, le service doit le signaler
          clairement au lieu de combler les manques par une certitude artificielle.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Comparaison</h2>
        <p>
          Les candidats, partis et programmes doivent être comparés avec des critères aussi stables
          que possible : thème, période, type de source, statut de vérification et limites connues.
          Les corrections documentées sont préférées aux affirmations définitives.
        </p>
      </section>
    </LegalPage>
  )
}
