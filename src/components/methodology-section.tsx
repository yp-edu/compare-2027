import { FileText, GitCompareArrows, ShieldCheck } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const methodologySteps = [
  {
    description:
      'Chaque affirmation importante doit pouvoir renvoyer vers une déclaration, un vote, un programme ou un document officiel.',
    icon: FileText,
    title: 'Sourcer',
  },
  {
    description:
      'Les propositions sont rangées dans une grille commune pour faciliter une comparaison thème par thème.',
    icon: GitCompareArrows,
    title: 'Normaliser',
  },
  {
    description:
      'Les contenus distinguent les faits publics, les résumés et les analyses pour limiter les confusions.',
    icon: ShieldCheck,
    title: 'Clarifier',
  },
]

export function MethodologySection() {
  return (
    <section id="methode" className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl rounded-3xl border border-border bg-background/75 p-6 shadow-2xl shadow-primary/5 backdrop-blur sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">Méthode</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Neutre ne veut pas dire vague.
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Le projet doit rendre les différences politiques compréhensibles tout en restant
              transparent sur les sources, les catégories et les limites de comparaison.
            </p>
          </div>
          <div className="grid gap-4">
            {methodologySteps.map((step) => {
              const Icon = step.icon

              return (
                <Card key={step.title} className="bg-card/90">
                  <CardHeader className="flex-row items-start gap-4 space-y-0">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                      <CardContent className="px-0 pb-0 pt-3">
                        <p className="leading-7 text-muted-foreground">{step.description}</p>
                      </CardContent>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
