import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { demoCandidates, demoParties } from '@/data/demo-2022'

const fallbackColor = '#64748B'

const partiesBySlug = new Map(demoParties.map((party) => [party.slug, party]))

function getHexColor(color?: string) {
  return color && /^#[\dA-F]{6}$/i.test(color) ? color : fallbackColor
}

export function CandidateCorpusPreview() {
  return (
    <section className="px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <Badge variant="secondary">Corpus de démonstration</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Les 12 candidats de 2022 pour commencer à comparer.
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            La base de démo reprend les candidats du premier tour publiés par la CNCCEP, associés à
            leur parti ou mouvement et à une couleur de repère visuel.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {demoCandidates.map((candidate) => {
            const party = partiesBySlug.get(candidate.partySlug)
            const partyColor = getHexColor(party?.color)

            return (
              <Card
                className="overflow-hidden bg-card/85 backdrop-blur"
                key={candidate.slug}
                style={{ borderColor: `${partyColor}66` }}
              >
                <div className="h-2" style={{ backgroundColor: partyColor }} />
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      #{candidate.sortOrder.toString().padStart(2, '0')}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-black"
                      style={{ backgroundColor: `${partyColor}18`, color: partyColor }}
                    >
                      {party?.shortName || 'Parti'}
                    </span>
                  </div>
                  <CardTitle className="text-2xl leading-tight">{candidate.displayName}</CardTitle>
                  <CardDescription>{party?.name || 'Parti non renseigné'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Déclaration officielle CNCCEP reliée au CMS pour alimenter le comparateur.
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
