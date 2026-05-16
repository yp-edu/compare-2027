'use client'

import { useState } from 'react'
import { Download, Share } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useInstallPrompt } from '@/components/pwa/use-install-prompt'

type InstallAppButtonProps = {
  className?: string
}

export function InstallAppButton({ className }: InstallAppButtonProps) {
  const { canInstall, isIosInstallSupported, promptInstall } = useInstallPrompt()
  const [showIosHelp, setShowIosHelp] = useState(false)

  if (!canInstall && !isIosInstallSupported) {
    return null
  }

  async function handleClick() {
    if (canInstall) {
      await promptInstall()
      return
    }

    setShowIosHelp((value) => !value)
  }

  return (
    <div className={className ? `relative ${className}` : 'relative'}>
      <Button
        size="sm"
        variant="outline"
        onClick={handleClick}
        type="button"
        aria-label="Installer"
      >
        {isIosInstallSupported ? <Share aria-hidden="true" /> : <Download aria-hidden="true" />}
        <span className="hidden sm:inline">Installer</span>
      </Button>
      {showIosHelp ? (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-border bg-card p-4 text-sm font-semibold leading-6 text-card-foreground shadow-2xl shadow-primary/15">
          Sur iPhone ou iPad, ouvrez le menu de partage puis choisissez Ajouter à l’écran d’accueil.
        </div>
      ) : null}
    </div>
  )
}
