import type { PayloadRequest } from 'payload'

import { describe, expect, it } from 'vitest'

import { seedEndpoint } from '@/endpoints/seed'

function mockPayloadRequest(url: string) {
  return {
    headers: new Headers({ origin: 'https://untrusted.example.test' }),
    url,
  } as PayloadRequest
}

describe('seed endpoint', () => {
  it.each(['', '/api/admin/seed'])('rejects untrusted origins without throwing for url %j', async (url) => {
    const response = await seedEndpoint.handler(mockPayloadRequest(url))

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ error: 'Forbidden' })
  })
})
