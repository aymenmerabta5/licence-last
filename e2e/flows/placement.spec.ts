import { expect, test } from "@playwright/test"

import { loginAsAdmin, loginAsCompany, loginAsStudent } from "../fixtures/auth"
import { seedApplicationFixture } from "../fixtures/seed"
import { AdminValidationsPage } from "../pages/admin-validations.page"
import { CompanyCandidatesPage } from "../pages/company-candidates.page"
import { StudentApplicationsPage } from "../pages/student-applications.page"

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

      const candidatesPage = new CompanyCandidatesPage(page)
      await candidatesPage.gotoDashboard()
    })

    test("company can accept an application @requires-pending-applications", async ({
      page,
    }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Company Accept",
        status: "applied",
        pipelineStage: "offer",
      })

      const candidatesPage = new CompanyCandidatesPage(page)
      await candidatesPage.gotoOfferCandidates(fixture.offerId)
      await candidatesPage.acceptFirstCandidate()

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

      const candidatesPage = new CompanyCandidatesPage(page)
      await candidatesPage.gotoOfferCandidates(fixture.offerId)
      await candidatesPage.rejectFirstCandidate()

      await expect(page.getByText(/candidate refused/i).first()).toBeVisible({
        timeout: 10000,
      })
    })

    test("company can view application details", async ({ page }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Company Details",
        status: "applied",
        pipelineStage: "applied",
      })

      const candidatesPage = new CompanyCandidatesPage(page)
      await candidatesPage.gotoOfferCandidates(fixture.offerId)
      await expect(
        page.getByRole("heading", { name: /pipeline/i }),
      ).toBeVisible()
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

      const validationsPage = new AdminValidationsPage(page)
      await validationsPage.goto()
      await validationsPage.expectValidationVisible(fixture.applicationId)
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

      const validationsPage = new AdminValidationsPage(page)
      await validationsPage.openValidation(fixture.applicationId)

      const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const endDate = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000)
      await validationsPage.validatePlacement(startDate, endDate)
    })

    test("admin can reject a placement validation", async ({ page }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Admin Reject",
        status: "company_accepted",
        pipelineStage: "offer",
        includeCompanyAction: true,
      })

      const validationsPage = new AdminValidationsPage(page)
      await validationsPage.openValidation(fixture.applicationId)
      await validationsPage.rejectPlacement(
        "E2E rejection reason for deterministic validation flow.",
      )
    })

    test("admin can view validation details", async ({ page }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Admin Details",
        status: "company_accepted",
        pipelineStage: "offer",
        includeCompanyAction: true,
      })

      const validationsPage = new AdminValidationsPage(page)
      await validationsPage.openValidationFromList(fixture.applicationId)
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

      const applicationsPage = new StudentApplicationsPage(page)
      await applicationsPage.goto()
      await applicationsPage.expectApplicationVisible(fixture.offerTitle)
      await expect(
        applicationsPage
          .applicationCard(fixture.offerTitle)
          .getByText(/^validated$/i),
      ).toBeVisible()
    })

    test("student can see rejected placement status", async ({ page }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Student Rejected",
        status: "admin_rejected",
        pipelineStage: "rejected",
      })

      const applicationsPage = new StudentApplicationsPage(page)
      await applicationsPage.goto()
      await applicationsPage.expectApplicationVisible(fixture.offerTitle)
      await expect(
        applicationsPage
          .applicationCard(fixture.offerTitle)
          .getByText(/^rejected$/i),
      ).toBeVisible()
    })

    test("student sees pending status for in-progress applications", async ({
      page,
    }) => {
      const fixture = await seedApplicationFixture({
        titlePrefix: "Placement Student Pending",
        status: "applied",
        pipelineStage: "applied",
      })

      const applicationsPage = new StudentApplicationsPage(page)
      await applicationsPage.goto()
      await applicationsPage.expectApplicationVisible(fixture.offerTitle)
      await expect(
        applicationsPage
          .applicationCard(fixture.offerTitle)
          .getByText(/^applied$/i),
      ).toBeVisible()
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
      const studentApplicationsPage = new StudentApplicationsPage(studentPage)
      await studentApplicationsPage.goto()
      await studentApplicationsPage.expectApplicationVisible(fixture.offerTitle)
      await studentContext.close()

      const companyContext = await browser.newContext()
      const companyPage = await companyContext.newPage()
      await loginAsCompany(companyPage)
      const companyCandidatesPage = new CompanyCandidatesPage(companyPage)
      await companyCandidatesPage.gotoOfferCandidates(fixture.offerId)
      await companyContext.close()

      const adminContext = await browser.newContext()
      const adminPage = await adminContext.newPage()
      await loginAsAdmin(adminPage)
      const adminValidationsPage = new AdminValidationsPage(adminPage)
      await adminValidationsPage.openValidation(fixture.applicationId)
      await adminContext.close()
    })
  })
})
