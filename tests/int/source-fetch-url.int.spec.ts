import { EventEmitter } from 'node:events'
import type { ClientRequest, IncomingMessage, RequestOptions } from 'node:http'
import { Readable } from 'node:stream'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchSourceUrl, validateOutboundFetchUrl } from '@/features/sources/server/source-url'

const dnsMocks = vi.hoisted(() => ({
  lookup: vi.fn(),
}))
const requestMocks = vi.hoisted(() => ({
  httpRequest: vi.fn(),
  httpsRequest: vi.fn(),
}))

vi.mock('node:dns/promises', () => ({
  default: dnsMocks,
  lookup: dnsMocks.lookup,
}))
vi.mock('node:http', () => ({
  default: { request: requestMocks.httpRequest },
  request: requestMocks.httpRequest,
}))
vi.mock('node:https', () => ({
  default: { request: requestMocks.httpsRequest },
  request: requestMocks.httpsRequest,
}))

type MockLookup = (
  hostname: string,
  options: { all: true },
) => Promise<Array<{ address: string; family: 4 | 6 }>>
type MockRequest = (
  url: URL,
  options: RequestOptions,
  callback: (response: IncomingMessage) => void,
) => ClientRequest

const mockedLookup = vi.mocked(dnsMocks.lookup as unknown as MockLookup)
const mockedHttpsRequest = vi.mocked(requestMocks.httpsRequest as unknown as MockRequest)

function createIncomingMessage(args: {
  body?: string
  headers?: Record<string, string>
  status: number
}) {
  const response = Readable.from(args.body ? [Buffer.from(args.body)] : [])

  return Object.assign(response, {
    headers: args.headers || {},
    statusCode: args.status,
    statusMessage: args.status === 302 ? 'Found' : 'OK',
  }) as IncomingMessage
}

function mockHttpsResponse(args: {
  body?: string
  headers?: Record<string, string>
  onLookup?: (address: string | Array<{ address: string; family: number }>, family?: number) => void
  status: number
}) {
  mockedHttpsRequest.mockImplementation((url, options, callback) => {
    const request = new EventEmitter() as ClientRequest

    request.end = vi.fn(() => {
      const completeRequest = () => {
        callback(
          createIncomingMessage({
            body: args.body,
            headers: args.headers,
            status: args.status,
          }),
        )
      }

      if (!options.lookup) {
        completeRequest()
        return request
      }

      options.lookup(url.hostname, { all: false }, (error, address, family) => {
        if (error) {
          request.emit('error', error)
          return
        }

        args.onLookup?.(address, family)
        completeRequest()
      })

      return request
    }) as ClientRequest['end']

    return request
  })
}

describe('source outbound fetch URL validation', () => {
  afterEach(() => {
    vi.resetAllMocks()
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

  it('binds fetch connections to the validated DNS result', async () => {
    mockedLookup
      .mockResolvedValueOnce([{ address: '93.184.216.34', family: 4 }])
      .mockResolvedValueOnce([{ address: '10.0.0.7', family: 4 }])
    const lookupResults: Array<{
      address: string | Array<{ address: string; family: number }>
      family?: number
    }> = []

    mockHttpsResponse({
      body: 'source',
      onLookup: (address, family) => {
        lookupResults.push({ address, family })
      },
      status: 200,
    })

    const { response, url } = await fetchSourceUrl('https://source.example.test/path')

    await response.body?.cancel()

    expect(url).toBe('https://source.example.test/path')
    expect(response.status).toBe(200)
    expect(mockedLookup).toHaveBeenCalledTimes(1)
    expect(lookupResults).toEqual([{ address: '93.184.216.34', family: 4 }])
  })

  it('rejects redirects to blocked addresses before following them', async () => {
    mockedLookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }])
    mockHttpsResponse({ headers: { location: 'http://127.0.0.1/admin' }, status: 302 })

    await expect(fetchSourceUrl('https://source.example.test/path')).rejects.toThrow(
      'public IP address',
    )
    expect(mockedHttpsRequest).toHaveBeenCalledTimes(1)
  })
})
