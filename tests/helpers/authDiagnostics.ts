import type { APIResponse, Page, Request, Response } from '@playwright/test'

export function isSignInRequestURL(value: string) {
  try {
    return new URL(value).pathname.replace(/\/$/, '') === '/api/auth/sign-in/email'
  } catch {
    return false
  }
}

export function isAuthRequestURL(value: string) {
  try {
    return new URL(value).pathname.startsWith('/api/auth/')
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

export function getRequestSummary(request: Request | undefined) {
  if (!request) {
    return 'No /api/auth/sign-in/email request was observed.'
  }

  return [`Auth request URL: ${request.url()}`, `Auth request method: ${request.method()}`].join(
    '\n',
  )
}

export async function getPageSummary(page: Page) {
  const bodyText = await page
    .locator('body')
    .innerText({ timeout: 1_000 })
    .catch(() => '')

  return [`Current page URL: ${page.url()}`, `Current page text: ${truncate(bodyText)}`].join('\n')
}

export async function getLoginFormSummary(page: Page) {
  const summary = await page
    .evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).map((button) => ({
        ariaDisabled: button.getAttribute('aria-disabled'),
        disabled: button.disabled,
        text: button.innerText.trim(),
        type: button.type,
      }))
      const loginInput = document.querySelector<HTMLInputElement>('input[name="login"]')
      const passwordInput = document.querySelector<HTMLInputElement>('input[name="password"]')

      return {
        buttons,
        loginLength: loginInput?.value.length ?? null,
        passwordLength: passwordInput?.value.length ?? null,
      }
    })
    .catch((error: unknown) => ({
      error: error instanceof Error ? error.message : String(error),
    }))

  return `Login form state: ${truncate(JSON.stringify(summary))}`
}
