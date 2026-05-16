import { expect, test } from '@playwright/test'

import type { Page } from '@playwright/test'

import {
  getLoginFormSummary,
  getPageSummary,
  getRequestSummary,
  getResponseSummary,
  isSignInRequestURL,
} from '../helpers/authDiagnostics'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

function getBaseURL() {
  return (process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

function getVercelProtectionHeaders() {
  const vercelProtectionBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

  return vercelProtectionBypass
    ? {
        'x-vercel-protection-bypass': vercelProtectionBypass,
      }
    : undefined
}

test.describe('Admin auth diagnostics', () => {
  test.beforeAll(async () => {
    await seedTestUser()
  })

  test.afterAll(async ({}, testInfo) => {
    testInfo.setTimeout(60_000)

    await cleanupTestUser()
  })

  test('authenticates through the current Playwright origin', async ({
    page,
    request,
  }, testInfo) => {
    testInfo.setTimeout(60_000)

    const apiResponse = await request.post('/api/auth/sign-in/email', {
      data: {
        callbackURL: '/admin',
        email: testUser.email,
        password: testUser.password,
      },
      headers: getVercelProtectionHeaders(),
    })

    expect(apiResponse.ok(), await getResponseSummary(apiResponse)).toBe(true)

    await page.goto('/admin/login')

    const pageOrigin = new URL(page.url()).origin
    const signInRequestPromise = page.waitForRequest(
      (signInRequest) =>
        signInRequest.method() === 'POST' && isSignInRequestURL(signInRequest.url()),
      { timeout: 15_000 },
    )
    const signInResponsePromise = page.waitForResponse(
      (signInResponse) =>
        signInResponse.request().method() === 'POST' && isSignInRequestURL(signInResponse.url()),
      { timeout: 15_000 },
    )

    await page.locator('input[name="login"]').fill(testUser.email)
    await page.locator('input[name="password"]').fill(testUser.password)
    await page.getByRole('button', { name: 'Login' }).click()

    const signInRequest = await signInRequestPromise
    const signInOrigin = new URL(signInRequest.url()).origin

    expect(
      signInOrigin,
      [
        `Admin login posted to ${signInOrigin} while Playwright is browsing ${pageOrigin}.`,
        'If these differ on Vercel previews, auth cookies are written for a different host than the tested page.',
      ].join('\n'),
    ).toBe(pageOrigin)

    const signInResponse = await signInResponsePromise.catch(async () => {
      throw new Error(
        [
          'Admin login posted a sign-in request but did not receive a response.',
          getRequestSummary(signInRequest),
          await getLoginFormSummary(page),
          await getPageSummary(page),
        ].join('\n\n'),
      )
    })

    expect(signInResponse.ok(), await getResponseSummary(signInResponse)).toBe(true)
  })
})

test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(60_000)

    await seedTestUser()

    const context = await browser.newContext({
      baseURL: getBaseURL(),
      extraHTTPHeaders: getVercelProtectionHeaders(),
    })
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async ({}, testInfo) => {
    testInfo.setTimeout(60_000)

    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/?$/)
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto('/admin/collections/users')
    await expect(page).toHaveURL(/\/admin\/collections\/users\/?(?:\?.*)?$/)
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto('/admin/collections/users/create')
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="email"]')
    await expect(editViewArtifact).toBeVisible()
  })
})
