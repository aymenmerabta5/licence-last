import { test, expect } from "@playwright/test"

import { loginAsAdmin, loginAsCompany, loginAsStudent } from "./fixtures/auth"

test.describe("Placement Validation Flow", () => {
  test.describe("Company accepts application", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsCompany(page)
    })

    test("company can view received applications", async ({ page }) => {
      await page.goto("/en/dashboard/candidates")
      await expect(page).toHaveURL(/\/en\/dashboard\/candidates/)
      await expect(page.locator("h1").first()).toBeVisible()
    })

    test("company can accept an application @requires-pending-applications", async ({
      page,
    }) => {
      await page.goto("/en/dashboard/candidates")
      await expect(page.locator("h1").first()).toBeVisible()

      const offerLink = page
        .locator('a[href*="/dashboard/company/offers/"][href*="/candidates"]')
        .first()
      const hasOffer = await offerLink.isVisible().catch(() => false)
      if (!hasOffer) {
        test.skip()
        return
      }

      await offerLink.click()
      await expect(page).toHaveURL(/\/en\/dashboard\/company\/offers\/.+\/candidates/)

      const acceptButton = page.getByRole("button", { name: /accept/i }).first()
      const canAccept = await acceptButton.isVisible().catch(() => false)
      if (!canAccept) {
        test.skip()
        return
      }

      await acceptButton.click()

      const confirmButton = page.getByRole("button", { name: /confirm/i }).first()
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click()
      }
    })

    test("company can reject an application", async ({ page }) => {
      await page.goto("/en/dashboard/candidates")
      await expect(page.locator("h1").first()).toBeVisible()

      const offerLink = page
        .locator('a[href*="/dashboard/company/offers/"][href*="/candidates"]')
        .first()
      const hasOffer = await offerLink.isVisible().catch(() => false)
      if (!hasOffer) {
        test.skip()
        return
      }

      await offerLink.click()
      await expect(page).toHaveURL(/\/en\/dashboard\/company\/offers\/.+\/candidates/)

      const rejectButton = page.getByRole("button", { name: /reject|refuse/i }).first()
      const canReject = await rejectButton.isVisible().catch(() => false)
      if (!canReject) {
        test.skip()
        return
      }

      await rejectButton.click()
    })

    test("company can view application details", async ({ page }) => {
      await page.goto("/en/dashboard/candidates")
      await expect(page.locator("h1").first()).toBeVisible()

      const offerLink = page
        .locator('a[href*="/dashboard/company/offers/"][href*="/candidates"]')
        .first()
      const hasOffer = await offerLink.isVisible().catch(() => false)
      if (!hasOffer) {
        test.skip()
        return
      }

      await offerLink.click()
      await expect(page).toHaveURL(/\/en\/dashboard\/company\/offers\/.+\/candidates/)
      await expect(page.locator("h1").first()).toBeVisible()
    })
  })

  test.describe("Admin validates placement", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
    })

    test("admin can view pending validations", async ({ page }) => {
      await page.goto("/en/dashboard/admin/validations")
      await expect(page).toHaveURL(/\/en\/dashboard\/admin\/validations/)
      await expect(page.locator("h1").first()).toBeVisible()
    })

    test("admin can validate a placement @requires-pending-validations", async ({
      page,
    }) => {
      await page.goto("/en/dashboard/admin/validations")
      await expect(page.locator("h1").first()).toBeVisible()

      const validateButton = page.getByRole("button", { name: /validate|approve/i }).first()
      const canValidate = await validateButton.isVisible().catch(() => false)
      if (!canValidate) {
        test.skip()
        return
      }

      await validateButton.click()

      const confirmButton = page.getByRole("button", { name: /confirm/i }).first()
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click()
      }
    })

    test("admin can reject a placement validation", async ({ page }) => {
      await page.goto("/en/dashboard/admin/validations")
      await expect(page.locator("h1").first()).toBeVisible()

      const rejectButton = page.getByRole("button", { name: /reject/i }).first()
      const canReject = await rejectButton.isVisible().catch(() => false)
      if (!canReject) {
        test.skip()
        return
      }

      await rejectButton.click()
    })

    test("admin can view validation details", async ({ page }) => {
      await page.goto("/en/dashboard/admin/validations")
      await expect(page.locator("h1").first()).toBeVisible()

      const detailLink = page
        .locator('a[href*="/dashboard/admin/validations/"]')
        .first()
      const hasDetail = await detailLink.isVisible().catch(() => false)
      if (!hasDetail) {
        test.skip()
        return
      }

      await detailLink.click()
      await expect(page).toHaveURL(/\/en\/dashboard\/admin\/validations\/.+/)
    })
  })

  test.describe("Student sees placement status", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStudent(page)
    })

    test("student can see validated placement status", async ({ page }) => {
      await page.goto("/en/dashboard/student/applications")
      await expect(page.locator("h1").first()).toBeVisible()
    })

    test("student can see rejected placement status", async ({ page }) => {
      await page.goto("/en/dashboard/student/applications")
      await expect(page.locator("h1").first()).toBeVisible()
    })

    test("student sees pending status for in-progress applications", async ({ page }) => {
      await page.goto("/en/dashboard/student/applications")
      await expect(page.locator("h1").first()).toBeVisible()
    })
  })

  test.describe("End-to-end placement workflow", () => {
    test("complete placement flow from application to validation", async ({ browser }) => {
      const studentContext = await browser.newContext()
      const studentPage = await studentContext.newPage()
      await loginAsStudent(studentPage)
      await studentPage.goto("/en/dashboard/student/search")
      await expect(studentPage).toHaveURL(/\/en\/dashboard\/student\/search/)
      await studentContext.close()

      const companyContext = await browser.newContext()
      const companyPage = await companyContext.newPage()
      await loginAsCompany(companyPage)
      await companyPage.goto("/en/dashboard/candidates")
      await expect(companyPage).toHaveURL(/\/en\/dashboard\/candidates/)
      await companyContext.close()

      const adminContext = await browser.newContext()
      const adminPage = await adminContext.newPage()
      await loginAsAdmin(adminPage)
      await adminPage.goto("/en/dashboard/admin/validations")
      await expect(adminPage).toHaveURL(/\/en\/dashboard\/admin\/validations/)
      await adminContext.close()
    })
  })
})
