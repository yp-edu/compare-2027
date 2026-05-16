import Link from 'next/link'
import { CheckCircle2, Landmark, LineChart, MessageCircleQuestion, UsersRound } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const comparisonCards = [
  {
    description:
      'Regrouper les mesures annoncées par thème pour éviter les lectures partielles ou isolées.',
    icon: Landmark,
    title: 'Programmes',
  },
  {
    description:
      'Comparer les votes, déclarations et propositions pour suivre les convergences et contradictions.',
    icon: LineChart,
    title: 'Positions publiques',
  },
  {
    description:
      'Situer les candidats dans leur parti, leurs alliances et leur historique politique.',
    icon: UsersRound,
    title: 'Candidats et partis',
  },
]

const checks = [
  'Sources citées et datables',
  'Résumé séparé de l’analyse',
  'Comparaisons par thème',
  'Mises à jour documentées',
]

export function ComparisonPreview() {
  return (
    <section id="comparaison" className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_0.55fr] lg:items-end">
          <div className="max-w-3xl">
            <Badge variant="secondary">Ce que l’outil doit rendre lisible</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Une comparaison structurée, pas un fil d’actualité.
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Compare 2027 transforme une question politique en lecture comparée : acteurs
              concernés, propositions disponibles, convergences, divergences et zones non sourcées.
            </p>
          </div>
          <Card className="border-primary/20 bg-primary text-primary-foreground shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <MessageCircleQuestion className="size-5" aria-hidden="true" />
                Exemple à poser
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-7 text-primary-foreground/85">
                “Compare les positions sur la fiscalité des ménages et indique ce qui est vraiment
                sourcé.”
              </p>
              <Button asChild className="mt-5" variant="secondary">
                <Link href="/compare">Ouvrir le comparateur</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {comparisonCards.map((card) => {
            const Icon = card.icon

            return (
              <Card key={card.title} className="bg-card/80 backdrop-blur">
                <CardHeader>
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-2xl">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <div className="mt-8 grid gap-3 rounded-2xl border border-border bg-primary p-5 text-primary-foreground shadow-xl sm:grid-cols-2 lg:grid-cols-4">
          {checks.map((check) => (
            <div key={check} className="flex items-center gap-3">
              <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
              <span className="text-sm font-semibold">{check}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
