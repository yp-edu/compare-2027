import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchSourceUrl, validateOutboundFetchUrl } from '@/features/sources/server/source-url'

const dnsMocks = vi.hoisted(() => ({
  lookup: vi.fn(),
}))

vi.mock('node:dns/promises', () => ({
  default: dnsMocks,
  lookup: dnsMocks.lookup,
}))

type MockLookup = (
  hostname: string,
  options: { all: true },
) => Promise<Array<{ address: string; family: 4 | 6 }>>

const mockedLookup = vi.mocked(dnsMocks.lookup as unknown as MockLookup)

describe('source outbound fetch URL validation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('rejects private literal IP addresses without DNS lookup', async () => {
    await expect(validateOutboundFetchUrl('http://127.0.0.1/source')).rejects.toThrow(
      'public IP address',
    )
    await expect(validateOutboundFetchUrl('http://[::1]/source')).rejects.toThrow(
      'public IP address',
    )
    await expect(validateOutboundFetchUrl('http://[::ffff:7f00:1]/source')).rejects.toThrow(
      'public IP address',
    )
    expect(mockedLookup).not.toHaveBeenCalled()
  })

  it('rejects unsupported URL schemes and embedded credentials', async () => {
    await expect(validateOutboundFetchUrl('file:///etc/passwd')).rejects.toThrow('HTTP or HTTPS')
    await expect(validateOutboundFetchUrl('https://user:pass@example.test/source')).rejects.toThrow(
      'credentials',
    )
    expect(mockedLookup).not.toHaveBeenCalled()
  })

  it('rejects hostnames that resolve to private addresses', async () => {
    mockedLookup.mockResolvedValue([{ address: '10.0.0.7', family: 4 }])

    await expect(validateOutboundFetchUrl('https://source.example.test/path')).rejects.toThrow(
      'only to public IP addresses',
    )
    expect(mockedLookup).toHaveBeenCalledWith('source.example.test', { all: true })
  })

  it('allows hostnames that resolve only to public addresses', async () => {
    mockedLookup.mockResolvedValue([
      { address: '93.184.216.34', family: 4 },
      { address: '2606:2800:220:1:248:1893:25c8:1946', family: 6 },
    ])

    await expect(
      validateOutboundFetchUrl('https://source.example.test/path'),
    ).resolves.toHaveProperty('href', 'https://source.example.test/path')
  })

  it('rejects redirects to blocked addresses before following them', async () => {
    mockedLookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }])
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('', {
        headers: { location: 'http://127.0.0.1/admin' },
        status: 302,
      }),
    )

    await expect(fetchSourceUrl('https://source.example.test/path')).rejects.toThrow(
      'public IP address',
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
