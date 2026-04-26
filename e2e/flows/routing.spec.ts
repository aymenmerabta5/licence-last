import { expect, test } from "@playwright/test"

import { loginAsCompany, loginAsStudent } from "../fixtures/auth"
import { seedOfferFixture } from "../fixtures/seed"

test.describe("Dashboard Route Redirects", () => {
  test("student applications alias redirects to the canonical applications page", async ({
    page,
  }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/student/applications")

    await expect(page).toHaveURL(/\/en\/dashboard\/applications$/)
  })

  test("student search alias redirects to the canonical explore page", async ({
    page,
  }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/student/search")

    await expect(page).toHaveURL(/\/en\/dashboard\/explore$/)
  })

  test("student offer detail alias redirects to the canonical explore detail page", async ({
    page,
  }) => {
    const offer = await seedOfferFixture({
      titlePrefix: "Routing Alias Offer",
    })

    await loginAsStudent(page)
    await page.goto(`/en/dashboard/student/offers/${offer.offerId}`)

    await expect(page).toHaveURL(
      new RegExp(`/en/dashboard/explore/${offer.offerId}$`),
    )
  })

  test("company is redirected away from the canonical student applications page", async ({
    page,
  }) => {
    await loginAsCompany(page)
    await page.goto("/en/dashboard/applications")

    await expect(page).toHaveURL(/\/en\/(dashboard|$)/)
  })
})
