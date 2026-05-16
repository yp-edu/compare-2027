import { afterEach, describe, expect, it, vi } from 'vitest'

import { sendPasswordResetEmail } from '@/features/email/server/auth-emails'

describe('auth emails', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('does not log reset links or recipient addresses when delivery is skipped', async () => {
    vi.stubEnv('RESEND_API_KEY', 'fake-test-key')
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    await sendPasswordResetEmail({
      url: 'https://compare2027.fr/reset-password?token=secret-reset-token',
      user: { email: 'person@example.com' },
    })

    const loggedOutput = JSON.stringify(infoSpy.mock.calls)

    expect(loggedOutput).not.toContain('secret-reset-token')
    expect(loggedOutput).not.toContain('person@example.com')
    expect(infoSpy).toHaveBeenCalledWith('[auth-email]', {
      reason: 'delivery skipped',
      subject: expect.any(String),
    })
  })
})
