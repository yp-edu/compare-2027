'use client'

import { Button, Gutter, toast, useAuth } from '@payloadcms/ui'
import { useState } from 'react'

type AdminUser = {
  role?: unknown
}

type SeedResponse = {
  adminUserCreated?: boolean
  error?: string
  ok?: boolean
}

function hasAdminRole(user: AdminUser | null | undefined) {
  const role = user?.role

  if (Array.isArray(role)) {
    return role.includes('admin')
  }

  return role === 'admin'
}

export function SeedButton() {
  const { user } = useAuth<AdminUser>()
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  if (!hasAdminRole(user)) {
    return null
  }

  async function handleSeed() {
    if (isRunning) {
      return
    }

    const confirmed = window.confirm(
      'Run the full seed now? This will create the seed admin user if needed and upsert campaign content.',
    )

    if (!confirmed) {
      return
    }

    setIsRunning(true)
    setStatus('Running full seed...')

    try {
      const response = await fetch('/api/admin/seed', {
        credentials: 'same-origin',
        headers: {
          'x-admin-action': 'seed',
        },
        method: 'POST',
      })
      const data = (await response.json().catch(() => ({}))) as SeedResponse

      if (!response.ok) {
        throw new Error(data.error || 'Seed failed')
      }

      const message = data.adminUserCreated
        ? 'Full seed completed. Check server logs for generated seed credentials.'
        : 'Full seed completed.'

      setStatus(message)
      toast.success(message)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Seed failed'

      setStatus(message)
      toast.error(message)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Gutter>
      <section
        style={{
          alignItems: 'center',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 8,
          display: 'flex',
          gap: 16,
          justifyContent: 'space-between',
          marginBottom: 24,
          padding: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Seed database</h2>
          <p style={{ margin: '6px 0 0' }}>
            Run the full seed script: admin seed checks and campaign content upserts.
          </p>
          {status ? <p style={{ margin: '8px 0 0' }}>{status}</p> : null}
        </div>
        <Button
          buttonStyle="primary"
          disabled={isRunning}
          extraButtonProps={{ 'aria-busy': isRunning }}
          onClick={handleSeed}
          type="button"
        >
          {isRunning ? 'Running seed...' : 'Run full seed'}
        </Button>
      </section>
    </Gutter>
  )
}
