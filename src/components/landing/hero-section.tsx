import Link from 'next/link'
import { ArrowRight, MessageSquareText, Scale, SearchCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type HeroSectionProps = {
  topics: string[]
}

export function HeroSection({ topics }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
      <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_50%_0%,oklch(0.86_0.09_79_/_0.45),transparent_70%)]" />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div>
          <Badge className="mb-6" variant="secondary">
            Comparateur politique impartial
          </Badge>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Comparez les programmes pour comprendre 2027.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Posez une question en langage naturel et obtenez une comparaison structurée entre
            candidats, partis, programmes et positions publiques, avec une méthode explicite.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/compare">
                Lancer une comparaison
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Badge key={topic} variant="outline">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
        <Card className="border-primary/15 bg-card/85 shadow-2xl shadow-primary/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <MessageSquareText className="size-5 text-primary" aria-hidden="true" />
              Une question, une grille commune
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg border border-border bg-background/70 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Exemple de question
              </p>
              <h2 className="mt-3 text-2xl font-bold">
                Quels candidats proposent une réforme de l’école ?
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                Le chat compare les propositions disponibles, signale les angles morts et sépare ce
                qui est sourcé de ce qui reste à vérifier.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-secondary p-4">
                <Scale className="mb-3 size-5 text-primary" aria-hidden="true" />
                <p className="font-semibold">Mêmes critères</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Chaque réponse suit une grille stable.
                </p>
              </div>
              <div className="rounded-lg bg-accent/70 p-4">
                <SearchCheck className="mb-3 size-5 text-accent-foreground" aria-hidden="true" />
                <p className="font-semibold">Sources d’abord</p>
                <p className="mt-1 text-sm text-accent-foreground/80">
                  Les limites de réponse sont explicites.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
