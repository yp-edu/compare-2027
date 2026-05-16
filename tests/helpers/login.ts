import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { getPageSummary, getResponseSummary, isSignInRequestURL } from './authDiagnostics'

export interface LoginOptions {
  page: Page
  serverURL?: string
  user: {
    email: string
    password: string
  }
}

/**
 * Logs the user into the admin panel via the login page.
 */
export async function login({
  page,
  serverURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
  user,
}: LoginOptions): Promise<void> {
  const normalizedServerURL = serverURL.replace(/\/$/, '')

  await page.goto(`${normalizedServerURL}/admin/login`)

  const signInResponsePromise = page
    .waitForResponse(
      (response) => response.request().method() === 'POST' && isSignInRequestURL(response.url()),
      { timeout: 15_000 },
    )
    .catch(() => undefined)

  await page.locator('input[name="login"]').fill(user.email)
  await page.locator('input[name="password"]').fill(user.password)
  await page.getByRole('button', { name: 'Login' }).click()

  try {
    await page.waitForURL(
      (url) => url.origin === normalizedServerURL && url.pathname.replace(/\/$/, '') === '/admin',
      { timeout: 15_000, waitUntil: 'domcontentloaded' },
    )
  } catch (error) {
    const signInResponse = await signInResponsePromise
    const pageSummary = await getPageSummary(page)
    const responseSummary = await getResponseSummary(signInResponse)
    const message = error instanceof Error ? error.message : String(error)

    throw new Error(
      [
        `Admin login did not reach ${normalizedServerURL}/admin.`,
        message,
        responseSummary,
        pageSummary,
      ].join('\n\n'),
    )
  }

  const dashboardArtifact = page.locator('span[title="Dashboard"]')
  await expect(dashboardArtifact).toBeVisible()
}
