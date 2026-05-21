import { describe, expect, it } from 'vitest'

import { inferSourcePlatformFromUrl } from '@/features/sources/platform'

describe('source platform inference', () => {
  it('matches datan.fr only as a registrable domain or subdomain', () => {
    expect(inferSourcePlatformFromUrl('https://datan.fr/deputes')).toBe('datan')
    expect(inferSourcePlatformFromUrl('https://www.datan.fr/deputes')).toBe('datan')
    expect(inferSourcePlatformFromUrl('https://api.datan.fr/deputes')).toBe('datan')

    expect(inferSourcePlatformFromUrl('https://notdatan.fr/deputes')).toBe('other')
    expect(inferSourcePlatformFromUrl('https://evil-datan.fr/deputes')).toBe('other')
  })
})
