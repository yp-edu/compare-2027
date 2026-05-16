'use client'

import type { ReactNode } from 'react'
import { WifiOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useOnlineStatus } from '@/components/pwa/use-online-status'

type OfflineGuardProps = {
  children?: ReactNode
  className?: string
  message?: string
}

export function OfflineGuard({
  children,
  className,
  message = 'Cette action nécessite une connexion Internet.',
}: OfflineGuardProps) {
  const { isOffline } = useOnlineStatus()

  if (!isOffline) {
    return <>{children}</>
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-primary/20 bg-secondary/80 p-4 text-sm font-semibold text-secondary-foreground',
        className,
      )}
      role="alert"
    >
      <WifiOff className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="space-y-3">
        <p>{message}</p>
        {children}
      </div>
    </div>
  )
}
