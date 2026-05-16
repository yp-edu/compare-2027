import { expect, test } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Compare 2027/)

    const heading = page.locator('h1').first()

    await expect(heading).toHaveText('Comparez les programmes pour comprendre 2027.')
  })
})
