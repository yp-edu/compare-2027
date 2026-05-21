import { EventEmitter } from 'node:events'
import type { ClientRequest, IncomingMessage, RequestOptions } from 'node:http'
import { Readable } from 'node:stream'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchSourceUrl, validateOutboundFetchUrl } from '@/features/sources/server/source-url'

const requestMocks = vi.hoisted(() => ({
  httpRequest: vi.fn(),
  httpsRequest: vi.fn(),
}))

vi.mock('node:http', () => ({
  default: { request: requestMocks.httpRequest },
  request: requestMocks.httpRequest,
}))
vi.mock('node:https', () => ({
  default: { request: requestMocks.httpsRequest },
  request: requestMocks.httpsRequest,
}))

type MockRequest = (
  url: URL,
  options: RequestOptions,
  callback: (response: IncomingMessage) => void,
) => ClientRequest

const mockedHttpsRequest = vi.mocked(requestMocks.httpsRequest as unknown as MockRequest)

function createMockRequest() {
  const request = new EventEmitter() as ClientRequest

  request.destroy = vi.fn((error?: Error) => {
    if (error) {
      request.emit('error', error)
    }

    return request
  }) as ClientRequest['destroy']
  request.setTimeout = vi.fn((_timeout: number, callback?: () => void) => {
    if (callback) {
      request.on('timeout', callback)
    }

    return request
  }) as ClientRequest['setTimeout']

  return request
}

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
  status: number
}) {
  mockedHttpsRequest.mockImplementation((_url, _options, callback) => {
    const request = createMockRequest()

    request.end = vi.fn(() => {
      callback(
        createIncomingMessage({
          body: args.body,
          headers: args.headers,
          status: args.status,
        }),
      )

      return request
    }) as ClientRequest['end']

    return request
  })
}

describe('source outbound fetch URL validation', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('rejects literal IP addresses', async () => {
    await expect(validateOutboundFetchUrl('http://93.184.216.34/source')).rejects.toThrow(
      'domain name',
    )
    await expect(validateOutboundFetchUrl('http://127.0.0.1/source')).rejects.toThrow('domain name')
    await expect(
      validateOutboundFetchUrl('http://[2606:2800:220:1:248:1893:25c8:1946]/source'),
    ).rejects.toThrow('domain name')
    await expect(validateOutboundFetchUrl('http://[::1]/source')).rejects.toThrow('domain name')
    await expect(validateOutboundFetchUrl('http://[::ffff:7f00:1]/source')).rejects.toThrow(
      'domain name',
    )
  })

  it('rejects unsupported URL schemes and embedded credentials', async () => {
    await expect(validateOutboundFetchUrl('file:///etc/passwd')).rejects.toThrow('HTTP or HTTPS')
    await expect(validateOutboundFetchUrl('https://user:pass@example.test/source')).rejects.toThrow(
      'credentials',
    )
  })

  it('allows domain hostnames', async () => {
    await expect(
      validateOutboundFetchUrl('https://source.example.test/path'),
    ).resolves.toHaveProperty('href', 'https://source.example.test/path')
  })

  it('rejects redirects to IP addresses before following them', async () => {
    mockHttpsResponse({ headers: { location: 'http://93.184.216.34/admin' }, status: 302 })

    await expect(fetchSourceUrl('https://source.example.test/path')).rejects.toThrow('domain name')
    expect(mockedHttpsRequest).toHaveBeenCalledTimes(1)
  })

  it('rejects stalled source fetches after the request timeout', async () => {
    const requestStarted = new Promise<ClientRequest>((resolve) => {
      mockedHttpsRequest.mockImplementation(() => {
        const request = createMockRequest()
        request.end = vi.fn(() => request) as ClientRequest['end']
        resolve(request)

        return request
      })
    })

    const fetchPromise = fetchSourceUrl('https://source.example.test/path')

    const request = await requestStarted
    request.emit('timeout')

    await expect(fetchPromise).rejects.toThrow('Source fetch timed out.')
    expect(request.setTimeout).toHaveBeenCalledWith(30_000, expect.any(Function))
    expect(request.destroy).toHaveBeenCalledWith(expect.any(Error))
  })
})
