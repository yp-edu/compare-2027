'use client'

import type { ReactNode } from 'react'

import { OfflineBanner } from '@/components/pwa/offline-banner'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'

export function PwaProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <ServiceWorkerRegister />
      {children}
      <OfflineBanner />
    </>
  )
}
