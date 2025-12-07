import { test, expect } from '@playwright/test'

test.describe('Candidate Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'recruiter@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/recruiter')
  })

  test('should navigate to candidate management', async ({ page }) => {
    await page.goto('/recruiter/candidates')

    expect(page.url()).toContain('/candidates')
    await expect(page.locator('h1')).toContainText(/candidate/i)
  })

  test('should create new candidate', async ({ page }) => {
    await page.goto('/recruiter/candidates/new')

    await page.fill('input[name="email"]', 'newcandidate@example.com')
    await page.fill('input[name="firstName"]', 'New')
    await page.fill('input[name="lastName"]', 'Candidate')
    await page.click('button[type="submit"]')

    // Wait for redirect to candidates list
    await page.waitForURL('/recruiter/candidates', { timeout: 5000 })
  })

  test('should search candidates', async ({ page }) => {
    await page.goto('/recruiter/candidates')

    const searchInput = page.locator('input[type="text"]').first()
    await searchInput.fill('test')
    await searchInput.press('Enter')

    // Wait for search results
    await page.waitForTimeout(1000)
  })
})



