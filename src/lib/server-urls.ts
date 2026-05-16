const localServerURL = 'http://localhost:3000'

function getVercelOrigin(value: string | undefined) {
  const origin = value?.trim().replace(/\/+$/, '')

  if (!origin) {
    return undefined
  }

  return /^https?:\/\//.test(origin) ? origin : `https://${origin}`
}

function uniqueOrigins(origins: Array<string | undefined>) {
  return Array.from(new Set(origins.filter((origin): origin is string => Boolean(origin))))
}

export function getServerURL() {
  const deploymentURL = getVercelOrigin(process.env.VERCEL_URL)
  const branchURL = getVercelOrigin(process.env.VERCEL_BRANCH_URL)
  const productionURL = getVercelOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL)

  if (process.env.VERCEL_ENV === 'production' && productionURL) {
    return productionURL
  }

  return branchURL || deploymentURL || localServerURL
}

export function getAllowedOrigins() {
  const deploymentURL = getVercelOrigin(process.env.VERCEL_URL)
  const branchURL =
    process.env.VERCEL_ENV === 'production'
      ? undefined
      : getVercelOrigin(process.env.VERCEL_BRANCH_URL)

  return uniqueOrigins([getServerURL(), deploymentURL, branchURL])
}
