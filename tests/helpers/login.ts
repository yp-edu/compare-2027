import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

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

  const fields = page.getByRole('textbox')

  await fields.first().fill(user.email)
  await fields.nth(1).fill(user.password)
  await page.getByRole('button', { name: 'Login' }).click()

  await page.waitForURL(`${normalizedServerURL}/admin`)

  const dashboardArtifact = page.locator('span[title="Dashboard"]')
  await expect(dashboardArtifact).toBeVisible()
}
