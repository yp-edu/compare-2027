import type { APIResponse, Page, Response } from '@playwright/test'

export function isSignInRequestURL(value: string) {
  try {
    return new URL(value).pathname === '/api/auth/sign-in/email'
  } catch {
    return false
  }
}

function truncate(value: string, length = 1_000) {
  return value.length > length ? `${value.slice(0, length)}...` : value
}

export async function getResponseSummary(response: APIResponse | Response | undefined) {
  if (!response) {
    return 'No /api/auth/sign-in/email response was observed.'
  }

  const body = await response.text().catch((error: unknown) => {
    return `Unable to read response body: ${error instanceof Error ? error.message : String(error)}`
  })

  return [
    `Auth response URL: ${response.url()}`,
    `Auth response status: ${response.status()}`,
    `Auth response body: ${truncate(body)}`,
  ].join('\n')
}

export async function getPageSummary(page: Page) {
  const bodyText = await page
    .locator('body')
    .innerText({ timeout: 1_000 })
    .catch(() => '')

  return [`Current page URL: ${page.url()}`, `Current page text: ${truncate(bodyText)}`].join('\n')
}
