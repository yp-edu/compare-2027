'use client'

import { WifiOff } from 'lucide-react'

import { useOnlineStatus } from '@/components/pwa/use-online-status'

export function OfflineBanner() {
  const { isOffline } = useOnlineStatus()

  if (!isOffline) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:bottom-6">
      <div
        className="pointer-events-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-primary/20 bg-card/95 px-4 py-3 text-sm font-semibold text-card-foreground shadow-2xl shadow-primary/15 backdrop-blur"
        role="status"
      >
        <WifiOff className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <p>
          Vous êtes hors ligne. Les pages déjà chargées restent consultables, mais le chat et les
          actions de compte sont indisponibles.
        </p>
      </div>
    </div>
  )
}
