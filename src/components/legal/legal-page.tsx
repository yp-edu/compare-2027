import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'

type LegalPageProps = {
  children: ReactNode
  eyebrow: string
  title: string
}

export function LegalPage({ children, eyebrow, title }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="px-5 py-12 sm:px-8 lg:py-16">
        <article className="mx-auto max-w-3xl rounded-3xl border border-border bg-card/90 p-6 shadow-2xl shadow-primary/5 backdrop-blur sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
          <div className="mt-8 space-y-8 text-base leading-8 text-muted-foreground">{children}</div>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
