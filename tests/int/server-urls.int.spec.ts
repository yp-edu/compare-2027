import { afterEach, describe, expect, it, vi } from 'vitest'

import { getAllowedOrigins, getServerURL } from '@/lib/server-urls'

describe('server URL configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses and trusts the Vercel branch URL for preview deployments', () => {
    vi.stubEnv('VERCEL_ENV', 'preview')
    vi.stubEnv('VERCEL_BRANCH_URL', 'compare-2027-git-bugs-xmaster6ys-projects.vercel.app')
    vi.stubEnv('VERCEL_URL', 'compare-2027-abc123-xmaster6ys-projects.vercel.app')

    expect(getServerURL()).toBe('https://compare-2027-git-bugs-xmaster6ys-projects.vercel.app')
    expect(getAllowedOrigins()).toEqual([
      'https://compare-2027-git-bugs-xmaster6ys-projects.vercel.app',
      'https://compare-2027-abc123-xmaster6ys-projects.vercel.app',
    ])
  })

  it('uses the production project URL for production deployments', () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('VERCEL_BRANCH_URL', 'compare-2027-git-main-xmaster6ys-projects.vercel.app')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'compare2027.fr')
    vi.stubEnv('VERCEL_URL', 'compare-2027-prod123-xmaster6ys-projects.vercel.app')

    expect(getServerURL()).toBe('https://compare2027.fr')
    expect(getAllowedOrigins()).toEqual([
      'https://compare2027.fr',
      'https://compare-2027-prod123-xmaster6ys-projects.vercel.app',
    ])
  })
})
