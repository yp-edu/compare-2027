import { afterEach, describe, expect, it, vi } from 'vitest'

import { getAllowedHosts, getAllowedOrigins, getServerURL } from '@/lib/server-urls'

function testHost(label: string) {
  return `${label}.example.test`
}

describe('server URL configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses and trusts the Vercel branch URL for preview deployments', () => {
    const branchURL = testHost('preview-branch')
    const deploymentURL = testHost('preview-deployment')

    vi.stubEnv('VERCEL_ENV', 'preview')
    vi.stubEnv('VERCEL_BRANCH_URL', branchURL)
    vi.stubEnv('VERCEL_URL', deploymentURL)

    expect(getServerURL()).toBe(`https://${branchURL}`)
    expect(getAllowedOrigins()).toEqual([`https://${branchURL}`, `https://${deploymentURL}`])
    expect(getAllowedHosts()).toEqual([branchURL, deploymentURL])
  })

  it('uses the production project URL for production deployments', () => {
    const branchURL = testHost('production-branch')
    const deploymentURL = testHost('production-deployment')
    const productionURL = testHost('production')

    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('VERCEL_BRANCH_URL', branchURL)
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', productionURL)
    vi.stubEnv('VERCEL_URL', deploymentURL)

    expect(getServerURL()).toBe(`https://${productionURL}`)
    expect(getAllowedOrigins()).toEqual([`https://${productionURL}`, `https://${deploymentURL}`])
    expect(getAllowedHosts()).toEqual([productionURL, deploymentURL])
  })
})
