import { test, expect } from "@playwright/test"
import { loginAsStudent } from "./fixtures/auth"

test.describe("Student Application Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as student before each test
    await loginAsStudent(page)
  })

  test("student can browse and search for offers", async ({ page }) => {
    // Navigate to explore page
    await page.goto("/en/dashboard/explore")

    // Wait for offers to load
    await page.waitForSelector("[data-testid='offer-card'], [data-testid='offer-list'], .offer-card", {
      timeout: 10000,
    })

    // Verify search functionality exists
    const searchInput = page.locator('input[placeholder*="search" i], input[name="search"], [data-testid="search-input"]').first()
    await expect(searchInput).toBeVisible()

    // Test search functionality
    await searchInput.fill("software")
    await searchInput.press("Enter")

    // Wait for search results (might show loading then results)
    await page.waitForTimeout(1000)

    // Should still show offers or "no results" message
    const offersOrEmpty = page.locator("[data-testid='offer-card'], [data-testid='no-results'], text=/no offers|no results/i").first()
    await expect(offersOrEmpty).toBeVisible()
  })

  test("student can view offer details", async ({ page }) => {
    // Navigate to explore page
    await page.goto("/en/dashboard/explore")

    // Wait for offers to load
    await page.waitForSelector("[data-testid='offer-card'], .offer-card, a[href*='offer']", {
      timeout: 10000,
    })

    // Click on first offer
    const firstOffer = page.locator("[data-testid='offer-card'], .offer-card, a[href*='offer']").first()
    await firstOffer.click()

    // Should navigate to offer detail page
    await expect(page).toHaveURL(/.*\/explore\/.+/, { timeout: 10000 })

    // Verify offer details are displayed
    const offerTitle = page.locator("h1, [data-testid='offer-title']").first()
    await expect(offerTitle).toBeVisible()

    // Verify apply button or status is shown
    const applyButton = page.locator("button:has-text('Apply'), [data-testid='apply-button'], text=/apply|applied/i").first()
    await expect(applyButton).toBeVisible()
  })

  test("student can apply to an offer", async ({ page }) => {
    // Navigate to explore page
    await page.goto("/en/dashboard/explore")

    // Wait for offers to load and click first one - fail if none found
    const offers = page.locator("[data-testid='offer-card'], .offer-card")
    await expect(offers.first()).toBeVisible({ timeout: 10000 })
    await offers.first().click()

    // Wait for offer detail page
    await expect(page).toHaveURL(/.*\/explore\/.+/, { timeout: 10000 })

    // Find apply button - fail if not found
    const applyButton = page.locator("button:has-text('Apply'), [data-testid='apply-button']").first()
    await expect(applyButton).toBeVisible()
    
    // Get button text to check state
    const buttonText = await applyButton.textContent()
    
    // Skip if already applied (precondition not met)
    if (buttonText?.toLowerCase().includes("applied")) {
      test.skip()
      return
    }
    
    // Must have Apply button to proceed
    expect(buttonText?.toLowerCase()).toContain("apply")
    await applyButton.click()

    // Handle application modal/form if present
    const modal = page.locator("[data-testid='apply-modal'], [role='dialog']").first()
    try {
      await expect(modal).toBeVisible({ timeout: 3000 })
      
      // Fill cover letter if field exists
      const coverLetterInput = page.locator("textarea[name='coverLetter'], [data-testid='cover-letter']").first()
      if (await coverLetterInput.isVisible().catch(() => false)) {
        await coverLetterInput.fill("I am very interested in this internship opportunity.")
      }

      // Submit application
      const submitButton = modal.locator("button[type='submit'], button:has-text('Submit')").first()
      await expect(submitButton).toBeVisible()
      await submitButton.click()
    } catch {
      // No modal - direct submission, continue to verification
    }

    // Verify success state - fail if not shown
    const successMessage = page.locator("text=/successfully|application submitted|applied/i").first()
    await expect(successMessage).toBeVisible({ timeout: 5000 })
  })

  test("student can view their applications", async ({ page }) => {
    // Navigate to applications page
    await page.goto("/en/dashboard/student/applications")

    // Wait for page to load
    await page.waitForLoadState("networkidle")

    // Verify page title or heading
    const heading = page.locator("h1, h2, [data-testid='page-title']").first()
    await expect(heading).toBeVisible()

    // Should show either applications list or empty state
    const content = page.locator("[data-testid='applications-list'], [data-testid='empty-state'], text=/no applications|my applications/i").first()
    await expect(content).toBeVisible()
  })

  test("application status is visible in applications list", async ({ page }) => {
    // Navigate to applications page
    await page.goto("/en/dashboard/student/applications")

    // Wait for page to load
    await page.waitForLoadState("networkidle")

    // Check if there are any applications
    const applicationsList = page.locator("[data-testid='applications-list'], [data-testid='application-card']")
    const count = await applicationsList.count()

    if (count > 0) {
      // Verify status is shown for first application
      const statusBadge = page.locator("[data-testid='status-badge'], text=/applied|pending|accepted|rejected/i").first()
      await expect(statusBadge).toBeVisible()
    } else {
      // Verify empty state is shown
      const emptyState = page.locator("[data-testid='empty-state'], text=/no applications|start applying/i").first()
      await expect(emptyState).toBeVisible()
    }
  })

  test("student can withdraw an application @requires-applications", async ({ page }) => {
    // Navigate to applications page
    await page.goto("/en/dashboard/student/applications")

    // Wait for page to load
    await page.waitForLoadState("networkidle")

    // Check if there are withdrawable applications
    const withdrawButton = page.locator("button:has-text('Withdraw'), [data-testid='withdraw-button']").first()
    
    // Skip if no withdrawable applications (precondition not met)
    const isVisible = await withdrawButton.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }
    
    // Must have withdraw button to proceed
    await expect(withdrawButton).toBeVisible()
    await withdrawButton.click()

    // Confirm withdrawal if prompted
    const confirmButton = page.locator("button:has-text('Confirm'), button:has-text('Yes')").first()
    if (await confirmButton.isVisible().catch(() => false)) {
      await confirmButton.click()
    }

    // Verify success message - fail if not shown
    const successMessage = page.locator("text=/withdrawn|successfully/i").first()
    await expect(successMessage).toBeVisible({ timeout: 5000 })
  })

  test("offer detail shows company information", async ({ page }) => {
    // Navigate to explore page
    await page.goto("/en/dashboard/explore")

    // Wait for offers and click first one
    await page.waitForSelector("[data-testid='offer-card'], .offer-card", { timeout: 10000 })
    
    const firstOffer = page.locator("[data-testid='offer-card'], .offer-card").first()
    await firstOffer.click()

    // Wait for offer detail page
    await expect(page).toHaveURL(/.*\/explore\/.+/, { timeout: 10000 })

    // Verify company info is displayed
    const companyName = page.locator("[data-testid='company-name'], text=/company|offered by/i").first()
    await expect(companyName).toBeVisible()
  })
})
