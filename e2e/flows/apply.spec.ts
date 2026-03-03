import { expect, test } from "@playwright/test"

import { loginAsStudent } from "../fixtures/auth"
import { seedApplicationFixture, seedOfferFixture } from "../fixtures/seed"
import { StudentApplicationsPage } from "../pages/student-applications.page"
import { StudentSearchPage } from "../pages/student-search.page"

test.describe("Student Application Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page)
  })

  test("student can browse and search for offers", async ({ page }) => {
    const offer = await seedOfferFixture({
      titlePrefix: "Apply Search Offer",
    })

    const searchPage = new StudentSearchPage(page)
    await searchPage.goto()
    await searchPage.searchByKeyword(offer.searchToken)
    await searchPage.expectOfferVisible(offer.offerId)
  })

  test("student can view offer details", async ({ page }) => {
    const offer = await seedOfferFixture({
      titlePrefix: "Apply Detail Offer",
    })

    const searchPage = new StudentSearchPage(page)
    await searchPage.openSeededOfferDetails(offer)
    await expect(page.locator("h1").first()).toBeVisible()
  })

  test("student can apply to an offer", async ({ page }) => {
    const offer = await seedOfferFixture({
      titlePrefix: "Apply Submit Offer",
    })

    const searchPage = new StudentSearchPage(page)
    await searchPage.openSeededOfferDetails(offer)
    await searchPage.clickApplyNow()
    await searchPage.fillCoverLetter("I am interested in this internship opportunity.")
    await searchPage.submitApplication()
    await searchPage.expectApplicationSubmitted()
  })

  test("student can view their applications", async ({ page }) => {
    const fixture = await seedApplicationFixture({
      titlePrefix: "Applications List Offer",
      status: "applied",
      pipelineStage: "applied",
    })

    const applicationsPage = new StudentApplicationsPage(page)
    await applicationsPage.goto()
    await applicationsPage.expectApplicationVisible(fixture.offerTitle)
  })

  test("application status is visible in applications list", async ({ page }) => {
    const fixture = await seedApplicationFixture({
      titlePrefix: "Applications Status Offer",
      status: "company_accepted",
      pipelineStage: "offer",
      includeCompanyAction: true,
    })

    const applicationsPage = new StudentApplicationsPage(page)
    await applicationsPage.goto()
    await applicationsPage.expectApplicationVisible(fixture.offerTitle)
    await applicationsPage.expectStatusText(
      fixture.offerTitle,
      /^(applied|accepted|rejected|withdrawn|validated)$/i,
    )
  })

  test("student can withdraw an application @requires-applications", async ({
    page,
  }) => {
    const fixture = await seedApplicationFixture({
      titlePrefix: "Applications Withdraw Offer",
      status: "applied",
      pipelineStage: "applied",
    })

    const applicationsPage = new StudentApplicationsPage(page)
    await applicationsPage.goto()
    await applicationsPage.expectApplicationVisible(fixture.offerTitle)
    await applicationsPage.withdrawApplication(fixture.offerTitle)
    await applicationsPage.expectWithdrawSuccess()
  })

  test("offer detail shows company information", async ({ page }) => {
    const offer = await seedOfferFixture({
      titlePrefix: "Apply Company Info Offer",
    })

    const searchPage = new StudentSearchPage(page)
    await searchPage.openSeededOfferDetails(offer)
    await expect(page.locator("text=/test company|company/i").first()).toBeVisible()
  })
})
