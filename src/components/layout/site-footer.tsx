import Link from 'next/link'

import { GITHUB_REPOSITORY_URL } from '@/lib/legal'

const footerSections = [
  {
    links: [
      { href: '/', label: 'Accueil' },
      { href: '/compare', label: 'Comparer' },
      { href: '/#methode', label: 'Méthode' },
    ],
    title: 'Explorer',
  },
  {
    links: [
      { href: '/cgu', label: 'CGU' },
      { href: '/confidentialite', label: 'Politique de confidentialité' },
      { href: '/neutralite', label: 'Charte de neutralité' },
    ],
    title: 'Cadre légal',
  },
] as const

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border/70 px-5 py-10 sm:px-8 lg:py-12">
      <div
        className="absolute inset-x-0 top-0 -z-10 h-48 bg-[radial-gradient(circle_at_50%_0%,oklch(0.86_0.09_79_/_0.22),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="mx-auto grid max-w-7xl gap-8 rounded-3xl border border-border bg-card/70 p-6 shadow-2xl shadow-primary/5 backdrop-blur sm:p-8 lg:grid-cols-[1.1fr_1.9fr]">
        <div className="max-w-xl">
          <Link
            className="inline-flex items-center gap-3"
            href="/"
            aria-label="Accueil Compare 2027"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-sm">
              C27
            </span>
            <span className="text-lg font-black tracking-tight">Compare 2027</span>
          </Link>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">
            Compare 2027 prépare une lecture claire et documentée de la campagne présidentielle,
            avec une méthode lisible et des limites explicites.
          </p>
          <div className="mt-5 rounded-2xl border border-border bg-background/65 p-4 text-sm leading-6 text-muted-foreground">
            <p className="font-semibold text-foreground">Sources, neutralité, transparence.</p>
            <p className="mt-1">
              Des comparaisons sourcées, pensées pour lire la campagne sans jargon ni conseil de
              vote.
            </p>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerSections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="font-semibold underline-offset-4 transition hover:text-foreground hover:underline"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Projet</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <a
                  className="font-semibold underline-offset-4 transition hover:text-foreground hover:underline"
                  href={GITHUB_REPOSITORY_URL}
                >
                  Code source
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; 2026 Compare 2027.</p>
        <p>Comparer sans recommander. Vérifier sans simplifier.</p>
      </div>
    </footer>
  )
}
