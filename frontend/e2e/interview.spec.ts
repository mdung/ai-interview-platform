import { test, expect } from '@playwright/test'

test.describe('Interview Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'recruiter@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/recruiter')
  })

  test('should create interview session', async ({ page }) => {
    await page.goto('/recruiter/sessions/new')

    // Select candidate and template
    await page.selectOption('select[id="candidateId"]', { index: 1 })
    await page.selectOption('select[id="templateId"]', { index: 1 })
    await page.click('button[type="submit"]')

    // Wait for session to be created
    await page.waitForURL(/\/recruiter\/sessions\/.*\/transcript/, { timeout: 5000 })
  })

  test('should display interview list', async ({ page }) => {
    await page.goto('/recruiter/sessions')

    // Check if sessions table is visible
    await expect(page.locator('table, .sessions-list')).toBeVisible()
  })
})

