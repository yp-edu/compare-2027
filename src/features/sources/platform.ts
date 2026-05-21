export function inferSourcePlatformFromUrl(url: string) {
  const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '')

  if (hostname === 'x.com' || hostname === 'twitter.com') {
    return 'x'
  }

  if (hostname === 'datan.fr' || hostname.endsWith('.datan.fr')) {
    return 'datan'
  }

  return 'other'
}
