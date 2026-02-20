import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"

import { loginAsStudent } from "./fixtures/auth"
import { seedApplicationFixture, seedOfferFixture } from "./fixtures/data"

async function gotoStudentSearch(page: Page) {
  await page.goto("/en/dashboard/student/search")
  await expect(page).toHaveURL(/\/en\/dashboard\/student\/search/)
  await expect(page.locator("input").first()).toBeVisible()
}

async function openSeededOfferDetails(
  page: Page,
  fixture: { offerId: string; searchToken: string },
) {
  await gotoStudentSearch(page)

  const searchInput = page.locator("input").first()
  await searchInput.fill(fixture.searchToken)
  await searchInput.press("Enter")

  const offerLink = page
    .locator(`a[href*="/dashboard/explore/${fixture.offerId}"]`)
    .first()
  await expect(offerLink).toBeVisible()
  await offerLink.click()

  await expect(page).toHaveURL(
    new RegExp(`/en/dashboard/explore/${fixture.offerId}$`),
  )
}

test.describe("Student Application Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page)
  })

  test("student can browse and search for offers", async ({ page }) => {
    const offer = await seedOfferFixture({
      titlePrefix: "Apply Search Offer",
    })

    await gotoStudentSearch(page)

    const searchInput = page.locator("input").first()
    await searchInput.fill(offer.searchToken)
    await searchInput.press("Enter")

    await expect(
      page.locator(`a[href*="/dashboard/explore/${offer.offerId}"]`).first(),
    ).toBeVisible()
  })

  test("student can view offer details", async ({ page }) => {
    const offer = await seedOfferFixture({
      titlePrefix: "Apply Detail Offer",
    })

    await openSeededOfferDetails(page, offer)
    await expect(page.locator("h1").first()).toBeVisible()
  })

  test("student can apply to an offer", async ({ page }) => {
    const offer = await seedOfferFixture({
      titlePrefix: "Apply Submit Offer",
    })

    await openSeededOfferDetails(page, offer)

    const applyButton = page.getByRole("button", { name: /apply/i }).first()
    await expect(applyButton).toBeVisible()
    await applyButton.click()

    const coverLetter = page.locator("#coverLetter")
    await expect(coverLetter).toBeVisible()
    await coverLetter.fill("I am interested in this internship opportunity.")

    await page.getByRole("button", { name: /submit/i }).first().click()

    await expect(
      page.locator("text=/application submitted successfully|applied|success/i"),
    ).toBeVisible({ timeout: 10000 })
  })

  test("student can view their applications", async ({ page }) => {
    const fixture = await seedApplicationFixture({
      titlePrefix: "Applications List Offer",
      status: "applied",
      pipelineStage: "applied",
    })

    await page.goto("/en/dashboard/student/applications")
    await expect(page).toHaveURL(/\/en\/dashboard\/student\/applications/)
    await expect(page.locator("h1").first()).toBeVisible()
    await expect(
      page.locator("article", { hasText: fixture.offerTitle }).first(),
    ).toBeVisible()
  })

  test("application status is visible in applications list", async ({ page }) => {
    const fixture = await seedApplicationFixture({
      titlePrefix: "Applications Status Offer",
      status: "company_accepted",
      pipelineStage: "offer",
      includeCompanyAction: true,
    })

    await page.goto("/en/dashboard/student/applications")
    await expect(page.locator("h1").first()).toBeVisible()

    const card = page.locator("article", { hasText: fixture.offerTitle }).first()
    await expect(card).toBeVisible()
    await expect(
      card.locator("text=/applied|accepted|rejected|withdrawn/i").first(),
    ).toBeVisible()
  })

  test("student can withdraw an application @requires-applications", async ({
    page,
  }) => {
    const fixture = await seedApplicationFixture({
      titlePrefix: "Applications Withdraw Offer",
      status: "applied",
      pipelineStage: "applied",
    })

    await page.goto("/en/dashboard/student/applications")
    await expect(page.locator("h1").first()).toBeVisible()

    const card = page.locator("article", { hasText: fixture.offerTitle }).first()
    await expect(card).toBeVisible()

    page.once("dialog", (dialog) => dialog.accept())
    await card.getByRole("button", { name: /withdraw/i }).click()

    await expect(
      page.locator("text=/withdrawn|application withdrawn successfully/i"),
    ).toBeVisible({ timeout: 10000 })
  })

  test("offer detail shows company information", async ({ page }) => {
    const offer = await seedOfferFixture({
      titlePrefix: "Apply Company Info Offer",
    })

    await openSeededOfferDetails(page, offer)
    await expect(page.locator("text=/test company|company/i").first()).toBeVisible()
  })
})
