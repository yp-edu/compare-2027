'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isIosSafari() {
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean }
  const ua = window.navigator.userAgent
  const isIosDevice =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome|Android/.test(ua)

  return isIosDevice && isSafari && !navigatorWithStandalone.standalone
}

function isStandaloneDisplay() {
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean(navigatorWithStandalone.standalone)
  )
}

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIosInstallSupported, setIsIosInstallSupported] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setIsStandalone(isStandaloneDisplay())
      setIsIosInstallSupported(isIosSafari())
    })

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setInstallPrompt(null)
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function promptInstall() {
    if (!installPrompt) {
      return 'unavailable' as const
    }

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    setInstallPrompt(null)

    return outcome
  }

  return {
    canInstall: !isStandalone && Boolean(installPrompt),
    installPrompt,
    isIosInstallSupported: !isStandalone && isIosInstallSupported,
    isStandalone,
    promptInstall,
  }
}
