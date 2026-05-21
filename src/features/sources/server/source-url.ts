import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { isIP } from 'node:net'
import { Readable } from 'node:stream'

const maxSourceUrlLength = 2048
const maxFetchRedirects = 5
const sourceFetchTimeoutMs = 30_000
const redirectStatuses = new Set([301, 302, 303, 307, 308])
const sourceFetchHeaders = {
  'User-Agent': 'Compare2027Bot/0.1 (+https://compare2027.fr)',
}

function getString(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const text = value.trim()

  return text && text.length <= maxSourceUrlLength ? text : null
}

function getAddressCheckHostname(url: URL) {
  return url.hostname.replace(/^\[|\]$/g, '')
}

async function getValidatedOutboundFetchTarget(value: string | URL) {
  let url: URL

  try {
    url = value instanceof URL ? new URL(value.toString()) : new URL(value)
  } catch {
    throw new Error('Source URL is invalid.')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Source URL must use HTTP or HTTPS.')
  }

  if (url.username || url.password) {
    throw new Error('Source URL must not include credentials.')
  }

  const hostname = getAddressCheckHostname(url)

  if (!hostname) {
    throw new Error('Source URL host is invalid.')
  }

  const ipVersion = isIP(hostname)

  if (ipVersion !== 0) {
    throw new Error('Source URL host must be a domain name.')
  }

  return url
}

export async function validateOutboundFetchUrl(value: string | URL) {
  return getValidatedOutboundFetchTarget(value)
}

export async function getSafeSourceUrl(value: unknown) {
  const text = getString(value)

  if (!text) {
    return null
  }

  try {
    return (await validateOutboundFetchUrl(text)).toString()
  } catch {
    return null
  }
}

export async function fetchSourceUrl(value: string | URL) {
  let url = await getValidatedOutboundFetchTarget(value)

  for (let redirectCount = 0; redirectCount <= maxFetchRedirects; redirectCount += 1) {
    const response = await fetchValidatedOutboundUrl(url)

    if (!redirectStatuses.has(response.status)) {
      return { response, url: url.toString() }
    }

    const location = response.headers.get('location')

    if (!location) {
      return { response, url: url.toString() }
    }

    if (redirectCount === maxFetchRedirects) {
      await response.body?.cancel()
      throw new Error('Source fetch exceeded the redirect limit.')
    }

    let redirectUrl: URL

    try {
      redirectUrl = new URL(location, url)
    } catch {
      await response.body?.cancel()
      throw new Error('Source fetch redirected to an invalid URL.')
    }

    await response.body?.cancel()
    url = await getValidatedOutboundFetchTarget(redirectUrl)
  }

  throw new Error('Source fetch exceeded the redirect limit.')
}

function getResponseHeaders(headers: Record<string, string | string[] | undefined>) {
  const responseHeaders = new Headers()

  for (const [name, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        responseHeaders.append(name, item)
      }
    } else if (value !== undefined) {
      responseHeaders.set(name, value)
    }
  }

  return responseHeaders
}

async function fetchValidatedOutboundUrl(url: URL) {
  const request = url.protocol === 'https:' ? httpsRequest : httpRequest

  return new Promise<Response>((resolve, reject) => {
    const outboundRequest = request(
      url,
      {
        headers: sourceFetchHeaders,
      },
      (incomingResponse) => {
        const status = incomingResponse.statusCode

        if (!status || status < 200 || status > 599) {
          incomingResponse.destroy()
          reject(new Error('Source fetch returned an invalid HTTP status.'))
          return
        }

        const body = [204, 205, 304].includes(status)
          ? null
          : (Readable.toWeb(incomingResponse) as unknown as ReadableStream<Uint8Array>)

        resolve(
          new Response(body, {
            headers: getResponseHeaders(incomingResponse.headers),
            status,
            statusText: incomingResponse.statusMessage,
          }),
        )
      },
    )

    outboundRequest.setTimeout(sourceFetchTimeoutMs, () => {
      outboundRequest.destroy(new Error('Source fetch timed out.'))
    })
    outboundRequest.on('error', reject)
    outboundRequest.end()
  })
}
