import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"

import { loginAsAdmin, loginAsCompany, loginAsStudent } from "./fixtures/auth"
import { seedApplicationFixture } from "./fixtures/data"

async function gotoCandidatesDashboard(page: Page) {
  await page.goto("/en/dashboard/candidates")
  await expect(page).toHaveURL(/\/en\/dashboard\/candidates/)
  await expect(page.locator("h1").first()).toBeVisible()
}

async function gotoAdminValidations(page: Page) {
  await page.goto("/en/dashboard/admin/validations")
  await expect(page).toHaveURL(/\/en\/dashboard\/admin\/validations/)
  await expect(page.locator("h1").first()).toBeVisible()
}

test.describe("Placement Validation Flow", () => {
  test.describe("Company accepts application", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsCompany(page)
    })

    test("company can view received applications", async ({ page }) => {
      await seedApplicationFixture({
        titlePrefix: "Placement Company Dashboard",
        status: "applied",
        pipelineStage: "applied",
      })

      await gotoCandidatesDashboard(page)
    })

    test("company can accept an application @requires-pending-applications", async ({
      page,
    }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Company Accept",
        status: "applied",
        pipelineStage: "offer",
      })

      await page.goto(
        `/en/dashboard/company/offers/${fixture.offerId}/candidates`,
      )
      await expect(page).toHaveURL(
        new RegExp(`/en/dashboard/company/offers/${fixture.offerId}/candidates$`),
      )

      const acceptButton = page.getByRole("button", { name: /^accept$/i }).first()
      await expect(acceptButton).toBeVisible()
      await acceptButton.click()

      const confirmAcceptButton = page
        .getByRole("button", { name: /^accept$/i })
        .last()
      await expect(confirmAcceptButton).toBeVisible()
      await confirmAcceptButton.click()

      await expect(
        page.locator("text=/company accepted|candidate accepted|accepted/i"),
      ).toBeVisible({ timeout: 10000 })
    })

    test("company can reject an application", async ({ page }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Company Reject",
        status: "applied",
        pipelineStage: "offer",
      })

      await page.goto(
        `/en/dashboard/company/offers/${fixture.offerId}/candidates`,
      )
      await expect(page).toHaveURL(
        new RegExp(`/en/dashboard/company/offers/${fixture.offerId}/candidates$`),
      )

      const refuseButton = page.getByRole("button", { name: /refuse/i }).first()
      await expect(refuseButton).toBeVisible()
      await refuseButton.click()

      const confirmRefuseButton = page
        .getByRole("button", { name: /refuse this candidate/i })
        .first()
      await expect(confirmRefuseButton).toBeVisible()
      await confirmRefuseButton.click()

      await expect(
        page.locator("text=/company refused|candidate refused|refused/i"),
      ).toBeVisible({ timeout: 10000 })
    })

    test("company can view application details", async ({ page }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Company Details",
        status: "applied",
        pipelineStage: "applied",
      })

      await page.goto(
        `/en/dashboard/company/offers/${fixture.offerId}/candidates`,
      )
      await expect(page).toHaveURL(
        new RegExp(`/en/dashboard/company/offers/${fixture.offerId}/candidates$`),
      )
      await expect(page.locator("h1").first()).toBeVisible()
    })
  })

  test.describe("Admin validates placement", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
    })

    test("admin can view pending validations", async ({ page }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Admin Pending",
        status: "company_accepted",
        pipelineStage: "offer",
        includeCompanyAction: true,
      })

      await gotoAdminValidations(page)
      await expect(
        page.locator(`a[href*="/dashboard/admin/validations/${fixture.applicationId}"]`),
      ).toBeVisible()
    })

    test("admin can validate a placement @requires-pending-validations", async ({
      page,
    }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Admin Validate",
        status: "company_accepted",
        pipelineStage: "offer",
        includeCompanyAction: true,
      })

      await page.goto(`/en/dashboard/admin/validations/${fixture.applicationId}`)
      await expect(page).toHaveURL(
        new RegExp(`/en/dashboard/admin/validations/${fixture.applicationId}$`),
      )

      const dateInputs = page.locator('input[type="date"]')
      const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const endDate = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000)

      await dateInputs.nth(0).fill(startDate.toISOString().slice(0, 10))
      await dateInputs.nth(1).fill(endDate.toISOString().slice(0, 10))

      page.once("dialog", (dialog) => dialog.accept())
      await page.getByRole("button", { name: /validate/i }).first().click()

      await expect(page).toHaveURL(/\/en\/dashboard\/admin\/validations$/, {
        timeout: 15000,
      })
    })

    test("admin can reject a placement validation", async ({ page }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Admin Reject",
        status: "company_accepted",
        pipelineStage: "offer",
        includeCompanyAction: true,
      })

      await page.goto(`/en/dashboard/admin/validations/${fixture.applicationId}`)
      await expect(page).toHaveURL(
        new RegExp(`/en/dashboard/admin/validations/${fixture.applicationId}$`),
      )

      await page.getByRole("button", { name: /reject/i }).first().click()
      await page
        .locator("textarea")
        .first()
        .fill("E2E rejection reason for deterministic validation flow.")
      await page.getByRole("button", { name: /confirm reject/i }).click()

      await expect(page).toHaveURL(/\/en\/dashboard\/admin\/validations$/, {
        timeout: 15000,
      })
    })

    test("admin can view validation details", async ({ page }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Admin Details",
        status: "company_accepted",
        pipelineStage: "offer",
        includeCompanyAction: true,
      })

      await gotoAdminValidations(page)

      await page
        .locator(`a[href*="/dashboard/admin/validations/${fixture.applicationId}"]`)
        .first()
        .click()

      await expect(page).toHaveURL(
        new RegExp(`/en/dashboard/admin/validations/${fixture.applicationId}$`),
      )
    })
  })

  test.describe("Student sees placement status", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStudent(page)
    })

    test("student can see validated placement status", async ({ page }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Student Validated",
        status: "admin_validated",
        pipelineStage: "accepted",
      })

      await page.goto("/en/dashboard/student/applications")
      await expect(page.locator("h1").first()).toBeVisible()

      const card = page.locator("article", { hasText: fixture.offerTitle }).first()
      await expect(card).toBeVisible()
      await expect(card.locator("text=/validated/i")).toBeVisible()
    })

    test("student can see rejected placement status", async ({ page }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Student Rejected",
        status: "admin_rejected",
        pipelineStage: "rejected",
      })

      await page.goto("/en/dashboard/student/applications")
      await expect(page.locator("h1").first()).toBeVisible()

      const card = page.locator("article", { hasText: fixture.offerTitle }).first()
      await expect(card).toBeVisible()
      await expect(card.locator("text=/rejected/i")).toBeVisible()
    })

    test("student sees pending status for in-progress applications", async ({
      page,
    }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Student Pending",
        status: "applied",
        pipelineStage: "applied",
      })

      await page.goto("/en/dashboard/student/applications")
      await expect(page.locator("h1").first()).toBeVisible()

      const card = page.locator("article", { hasText: fixture.offerTitle }).first()
      await expect(card).toBeVisible()
      await expect(card.locator("text=/applied/i")).toBeVisible()
    })
  })

  test.describe("End-to-end placement workflow", () => {
    test("complete placement flow from application to validation", async ({
      browser,
    }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Workflow",
        status: "company_accepted",
        pipelineStage: "offer",
        includeCompanyAction: true,
      })

      const studentContext = await browser.newContext()
      const studentPage = await studentContext.newPage()
      await loginAsStudent(studentPage)
      await studentPage.goto("/en/dashboard/student/applications")
      await expect(studentPage).toHaveURL(/\/en\/dashboard\/student\/applications/)
      await expect(
        studentPage.locator("article", { hasText: fixture.offerTitle }).first(),
      ).toBeVisible()
      await studentContext.close()

      const companyContext = await browser.newContext()
      const companyPage = await companyContext.newPage()
      await loginAsCompany(companyPage)
      await companyPage.goto(
        `/en/dashboard/company/offers/${fixture.offerId}/candidates`,
      )
      await expect(companyPage).toHaveURL(
        new RegExp(`/en/dashboard/company/offers/${fixture.offerId}/candidates$`),
      )
      await companyContext.close()

      const adminContext = await browser.newContext()
      const adminPage = await adminContext.newPage()
      await loginAsAdmin(adminPage)
      await adminPage.goto(
        `/en/dashboard/admin/validations/${fixture.applicationId}`,
      )
      await expect(adminPage).toHaveURL(
        new RegExp(`/en/dashboard/admin/validations/${fixture.applicationId}$`),
      )
      await adminContext.close()
    })
  })
})
