import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayloadAuth } from 'payload-auth/better-auth'

import { isLegalConsentCurrent } from '@/lib/legal'
import type { ConstructedBetterAuthPluginOptions } from '@/plugins/auth'

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const payload = await getPayloadAuth<ConstructedBetterAuthPluginOptions>(config)
  const session = await payload.betterAuth.api.getSession({ headers: await headers() })

  if (session?.user) {
    redirect(isLegalConsentCurrent(session.user) ? '/compare' : '/consent?next=/compare')
  }

  return children
}
