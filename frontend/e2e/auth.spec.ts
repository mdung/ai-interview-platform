import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')

    // Fill in login form
    await page.fill('input[type="email"]', 'recruiter@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Wait for navigation
    await page.waitForURL('/recruiter', { timeout: 5000 })

    // Verify we're on the dashboard
    expect(page.url()).toContain('/recruiter')
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Wait for error message
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 3000 })
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    await page.click('a[href*="register"]')

    expect(page.url()).toContain('/register')
  })
})


