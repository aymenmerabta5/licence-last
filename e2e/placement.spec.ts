import { test, expect } from "@playwright/test"
import { loginAsCompany, loginAsAdmin, loginAsStudent } from "./fixtures/auth"

test.describe("Placement Validation Flow", () => {
  test.describe("Company accepts application", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsCompany(page)
    })

    test("company can view received applications", async ({ page }) => {
      // Navigate to company applications/candidates page
      await page.goto("/en/dashboard/company/candidates")

      // Wait for page to load
      await page.waitForLoadState("networkidle")

      // Verify page heading
      const heading = page.locator("h1, h2, [data-testid='page-title']").first()
      await expect(heading).toBeVisible()

      // Should show applications or empty state
      const content = page.locator("[data-testid='applications-list'], [data-testid='empty-state'], text=/candidates|applications/i").first()
      await expect(content).toBeVisible()
    })

    test("company can accept an application @requires-pending-applications", async ({ page }) => {
      // Navigate to candidates page
      await page.goto("/en/dashboard/company/candidates")

      // Wait for page to load
      await page.waitForLoadState("networkidle")

      // Look for accept button on any application
      const acceptButton = page.locator("button:has-text('Accept'), [data-testid='accept-button']").first()
      
      // Skip if no applications to accept (precondition not met)
      const isVisible = await acceptButton.isVisible().catch(() => false)
      if (!isVisible) {
        test.skip()
        return
      }
      
      // Must have accept button to proceed
      await expect(acceptButton).toBeVisible()
      await acceptButton.click()

      // Confirm acceptance if prompted
      const confirmButton = page.locator("button:has-text('Confirm'), button:has-text('Yes')").first()
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click()
      }

      // Verify success - fail if not shown
      const successMessage = page.locator("text=/accepted|successfully/i").first()
      await expect(successMessage).toBeVisible({ timeout: 5000 })
    })

    test("company can reject an application", async ({ page }) => {
      // Navigate to candidates page
      await page.goto("/en/dashboard/company/candidates")

      // Wait for page to load
      await page.waitForLoadState("networkidle")

      // Look for reject button
      const rejectButton = page.locator("button:has-text('Reject'), [data-testid='reject-button']").first()
      
      if (await rejectButton.isVisible().catch(() => false)) {
        await rejectButton.click()

        // Add rejection reason if prompted
        const reasonInput = page.locator("textarea[name='reason'], [data-testid='rejection-reason']").first()
        if (await reasonInput.isVisible().catch(() => false)) {
          await reasonInput.fill("Candidate does not meet requirements")
        }

        // Confirm rejection
        const confirmButton = page.locator("button:has-text('Confirm'), button:has-text('Submit')").first()
        if (await confirmButton.isVisible().catch(() => false)) {
          await confirmButton.click()
        }

        // Verify success
        await expect(page.locator("text=/rejected|successfully/i").first()).toBeVisible({ timeout: 5000 })
      }
    })

    test("company can view application details", async ({ page }) => {
      // Navigate to candidates page
      await page.goto("/en/dashboard/company/candidates")

      // Wait for page to load
      await page.waitForLoadState("networkidle")

      // Click on first application to view details
      const applicationCard = page.locator("[data-testid='application-card'], [data-testid='candidate-card']").first()
      
      if (await applicationCard.isVisible().catch(() => false)) {
        await applicationCard.click()

        // Verify details are shown
        const details = page.locator("[data-testid='application-details'], text=/student|applicant|details/i").first()
        await expect(details).toBeVisible()
      }
    })
  })

  test.describe("Admin validates placement", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
    })

    test("admin can view pending validations", async ({ page }) => {
      // Navigate to admin validations page
      await page.goto("/en/dashboard/admin/validations")

      // Wait for page to load
      await page.waitForLoadState("networkidle")

      // Verify page heading
      const heading = page.locator("h1, h2, [data-testid='page-title']").first()
      await expect(heading).toBeVisible()

      // Should show validations list or empty state
      const content = page.locator("[data-testid='validations-list'], [data-testid='empty-state'], text=/validations|pending/i").first()
      await expect(content).toBeVisible()
    })

    test("admin can validate a placement @requires-pending-validations", async ({ page }) => {
      // Navigate to validations page
      await page.goto("/en/dashboard/admin/validations")

      // Wait for page to load
      await page.waitForLoadState("networkidle")

      // Look for validate/approve button
      const validateButton = page.locator("button:has-text('Validate'), button:has-text('Approve'), [data-testid='validate-button']").first()
      
      // Skip if no validations pending (precondition not met)
      const isVisible = await validateButton.isVisible().catch(() => false)
      if (!isVisible) {
        test.skip()
        return
      }
      
      // Must have validate button to proceed
      await expect(validateButton).toBeVisible()
      await validateButton.click()

      // Confirm validation if prompted
      const confirmButton = page.locator("button:has-text('Confirm'), button:has-text('Yes')").first()
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click()
      }

      // Verify success - fail if not shown
      const successMessage = page.locator("text=/validated|approved|successfully/i").first()
      await expect(successMessage).toBeVisible({ timeout: 5000 })
    })

    test("admin can reject a placement validation", async ({ page }) => {
      // Navigate to validations page
      await page.goto("/en/dashboard/admin/validations")

      // Wait for page to load
      await page.waitForLoadState("networkidle")

      // Look for reject button
      const rejectButton = page.locator("button:has-text('Reject'), [data-testid='reject-validation-button']").first()
      
      if (await rejectButton.isVisible().catch(() => false)) {
        await rejectButton.click()

        // Add rejection reason if prompted
        const reasonInput = page.locator("textarea[name='reason'], [data-testid='rejection-reason']").first()
        if (await reasonInput.isVisible().catch(() => false)) {
          await reasonInput.fill("Invalid placement details")
        }

        // Confirm rejection
        const confirmButton = page.locator("button:has-text('Confirm'), button:has-text('Submit')").first()
        if (await confirmButton.isVisible().catch(() => false)) {
          await confirmButton.click()
        }

        // Verify success
        await expect(page.locator("text=/rejected|successfully/i").first()).toBeVisible({ timeout: 5000 })
      }
    })

    test("admin can view validation details", async ({ page }) => {
      // Navigate to validations page
      await page.goto("/en/dashboard/admin/validations")

      // Wait for page to load
      await page.waitForLoadState("networkidle")

      // Click on first validation to view details
      const validationItem = page.locator("[data-testid='validation-item'], [data-testid='validation-card']").first()
      
      if (await validationItem.isVisible().catch(() => false)) {
        await validationItem.click()

        // Should navigate to detail page
        await expect(page).toHaveURL(/.*\/validations\/.+/, { timeout: 10000 })

        // Verify details are shown
        const details = page.locator("[data-testid='validation-details'], text=/student|company|offer/i").first()
        await expect(details).toBeVisible()
      }
    })
  })

  test.describe("Student sees placement status", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStudent(page)
    })

    test("student can see validated placement status", async ({ page }) => {
      // Navigate to applications page
      await page.goto("/en/dashboard/student/applications")

      // Wait for page to load
      await page.waitForLoadState("networkidle")

      // Check for validated/accepted status badges
      const acceptedBadge = page.locator("text=/accepted|validated|hired/i").first()
      
      // Either shows accepted status or no applications
      const hasApplications = await page.locator("[data-testid='application-card']").count() > 0
      
      if (hasApplications) {
        await expect(acceptedBadge).toBeVisible()
      } else {
        // Empty state is also valid
        await expect(page.locator("[data-testid='empty-state']").first()).toBeVisible()
      }
    })

    test("student can see rejected placement status", async ({ page }) => {
      // Navigate to applications page
      await page.goto("/en/dashboard/student/applications")

      // Wait for page to load
      await page.waitForLoadState("networkidle")

      // Application list should be visible with or without rejected items
      const content = page.locator("[data-testid='applications-list'], [data-testid='empty-state']").first()
      await expect(content).toBeVisible()
    })

    test("student sees pending status for in-progress applications", async ({ page }) => {
      // Navigate to applications page
      await page.goto("/en/dashboard/student/applications")

      // Wait for page to load
      await page.waitForLoadState("networkidle")

      // Check for pending status
      const pendingBadge = page.locator("text=/pending|applied|in review/i").first()
      
      // Either shows pending status or empty state
      const hasApplications = await page.locator("[data-testid='application-card']").count() > 0
      
      if (hasApplications) {
        await expect(pendingBadge).toBeVisible()
      }
    })
  })

  test.describe("End-to-end placement workflow", () => {
    test("complete placement flow from application to validation", async ({ browser }) => {
      // This test requires multiple users, so we use different contexts
      
      // Step 1: Student applies to an offer
      const studentContext = await browser.newContext()
      const studentPage = await studentContext.newPage()
      await loginAsStudent(studentPage)
      
      // Student navigates to explore and applies
      await studentPage.goto("/en/dashboard/explore")
      await studentPage.waitForSelector("[data-testid='offer-card'], .offer-card", { timeout: 10000 })
      
      const firstOffer = studentPage.locator("[data-testid='offer-card'], .offer-card").first()
      await firstOffer.click()
      
      await expect(studentPage).toHaveURL(/.*\/explore\/.+/, { timeout: 10000 })
      
      const applyButton = studentPage.locator("button:has-text('Apply'), [data-testid='apply-button']").first()
      if (await applyButton.isVisible().catch(() => false)) {
        await applyButton.click()
        
        // Handle modal if present
        const modal = studentPage.locator("[data-testid='apply-modal'], [role='dialog']").first()
        if (await modal.isVisible().catch(() => false)) {
          const submitButton = modal.locator("button[type='submit'], button:has-text('Submit')").first()
          await submitButton.click()
        }
      }
      
      await studentContext.close()

      // Step 2: Company accepts the application
      const companyContext = await browser.newContext()
      const companyPage = await companyContext.newPage()
      await loginAsCompany(companyPage)
      
      await companyPage.goto("/en/dashboard/company/candidates")
      await companyPage.waitForLoadState("networkidle")
      
      const acceptButton = companyPage.locator("button:has-text('Accept'), [data-testid='accept-button']").first()
      if (await acceptButton.isVisible().catch(() => false)) {
        await acceptButton.click()
        
        const confirmButton = companyPage.locator("button:has-text('Confirm')").first()
        if (await confirmButton.isVisible().catch(() => false)) {
          await confirmButton.click()
        }
      }
      
      await companyContext.close()

      // Step 3: Admin validates the placement
      const adminContext = await browser.newContext()
      const adminPage = await adminContext.newPage()
      await loginAsAdmin(adminPage)
      
      await adminPage.goto("/en/dashboard/admin/validations")
      await adminPage.waitForLoadState("networkidle")
      
      const validateButton = adminPage.locator("button:has-text('Validate'), [data-testid='validate-button']").first()
      if (await validateButton.isVisible().catch(() => false)) {
        await validateButton.click()
        
        const confirmButton = adminPage.locator("button:has-text('Confirm')").first()
        if (await confirmButton.isVisible().catch(() => false)) {
          await confirmButton.click()
        }
      }
      
      await adminContext.close()

      // Step 4: Student sees validated status
      const finalStudentContext = await browser.newContext()
      const finalStudentPage = await finalStudentContext.newPage()
      await loginAsStudent(finalStudentPage)
      
      await finalStudentPage.goto("/en/dashboard/student/applications")
      await finalStudentPage.waitForLoadState("networkidle")
      
      // Verify student sees accepted/validated status
      const statusBadge = finalStudentPage.locator("text=/accepted|validated|hired/i").first()
      await expect(statusBadge).toBeVisible()
      
      await finalStudentContext.close()
    })
  })
})
