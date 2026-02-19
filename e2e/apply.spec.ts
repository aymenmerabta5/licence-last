import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"

import { loginAsStudent } from "./fixtures/auth"

async function gotoStudentSearch(page: Page) {
  await page.goto("/en/dashboard/student/search")
  await expect(page).toHaveURL(/\/en\/dashboard\/student\/search/)
  await expect(page.locator("input").first()).toBeVisible()
}

test.describe("Student Application Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page)
  })

  test("student can browse and search for offers", async ({ page }) => {
    await gotoStudentSearch(page)

    const searchInput = page.locator("input").first()
    await searchInput.fill("software")
    await searchInput.press("Enter")
    await page.waitForTimeout(600)

    const offerLinks = page.locator('a[href*="/dashboard/explore/"]')
    const offerCount = await offerLinks.count()

    if (offerCount > 0) {
      await expect(offerLinks.first()).toBeVisible()
      return
    }

    await expect(
      page.locator("text=/no internships found|no results|no offers/i").first(),
    ).toBeVisible()
  })

  test("student can view offer details", async ({ page }) => {
    await gotoStudentSearch(page)

    const offerLinks = page.locator('a[href*="/dashboard/explore/"]')
    const offerCount = await offerLinks.count()
    if (offerCount === 0) {
      test.skip()
      return
    }

    await offerLinks.first().click()
    await expect(page).toHaveURL(/\/en\/dashboard\/explore\/.+/, {
      timeout: 10000,
    })
    await expect(page.locator("h1").first()).toBeVisible()
  })

  test("student can apply to an offer", async ({ page }) => {
    await gotoStudentSearch(page)

    const offerLinks = page.locator('a[href*="/dashboard/explore/"]')
    const offerCount = await offerLinks.count()
    if (offerCount === 0) {
      test.skip()
      return
    }

    await offerLinks.first().click()
    await expect(page).toHaveURL(/\/en\/dashboard\/explore\/.+/, {
      timeout: 10000,
    })

    const applyButton = page.getByRole("button", { name: /apply/i }).first()
    const canApply = await applyButton.isVisible().catch(() => false)
    if (!canApply) {
      test.skip()
      return
    }

    await applyButton.click()

    const coverLetter = page.locator("#coverLetter")
    if (await coverLetter.isVisible().catch(() => false)) {
      await coverLetter.fill("I am interested in this internship opportunity.")
      await page
        .getByRole("button", { name: /submit/i })
        .first()
        .click()
    }

    await expect(
      page.locator("text=/application|applied|success/i").first(),
    ).toBeVisible({
      timeout: 10000,
    })
  })

  test("student can view their applications", async ({ page }) => {
    await page.goto("/en/dashboard/student/applications")
    await expect(page).toHaveURL(/\/en\/dashboard\/student\/applications/)
    await expect(page.locator("h1").first()).toBeVisible()
  })

  test("application status is visible in applications list", async ({
    page,
  }) => {
    await page.goto("/en/dashboard/student/applications")
    await expect(page.locator("h1").first()).toBeVisible()

    const applicationCards = page.locator("article")
    const cardCount = await applicationCards.count()

    if (cardCount > 0) {
      await expect(
        page
          .locator(
            "text=/applied|accepted|rejected|withdrawn|screening|offer/i",
          )
          .first(),
      ).toBeVisible()
      return
    }

    await expect(page.locator("text=/no applications/i").first()).toBeVisible()
  })

  test("student can withdraw an application @requires-applications", async ({
    page,
  }) => {
    await page.goto("/en/dashboard/student/applications")
    await expect(page.locator("h1").first()).toBeVisible()

    const withdrawButton = page
      .getByRole("button", { name: /withdraw/i })
      .first()
    const isVisible = await withdrawButton.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    page.once("dialog", (dialog) => dialog.accept())
    await withdrawButton.click()

    await expect(page.locator("text=/withdrawn|success/i").first()).toBeVisible(
      { timeout: 10000 },
    )
  })

  test("offer detail shows company information", async ({ page }) => {
    await gotoStudentSearch(page)

    const offerLinks = page.locator('a[href*="/dashboard/explore/"]')
    const offerCount = await offerLinks.count()
    if (offerCount === 0) {
      test.skip()
      return
    }

    await offerLinks.first().click()
    await expect(page).toHaveURL(/\/en\/dashboard\/explore\/.+/, {
      timeout: 10000,
    })
    await expect(page.locator("text=/company/i").first()).toBeVisible()
  })
})
