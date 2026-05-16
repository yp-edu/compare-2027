import Link from 'next/link'
import type { ReactNode } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type AuthCardProps = {
  children: ReactNode
  description: string
  footerHref: string
  footerLabel: string
  footerText: string
  title: string
}

export function AuthCard({
  children,
  description,
  footerHref,
  footerLabel,
  footerText,
  title,
}: AuthCardProps) {
  return (
    <main className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-5 py-12 sm:px-8">
      <Card className="w-full max-w-md border-primary/15 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-3xl font-black tracking-tight">{title}</CardTitle>
          <CardDescription className="text-base leading-7">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footerText}{' '}
            <Link
              className="font-semibold text-primary underline-offset-4 hover:underline"
              href={footerHref}
            >
              {footerLabel}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
