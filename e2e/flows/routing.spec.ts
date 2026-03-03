import { expect, test } from "@playwright/test"

import { loginAsCompany, loginAsStudent } from "../fixtures/auth"
import { seedOfferFixture } from "../fixtures/seed"

test.describe("Dashboard Route Redirects", () => {
  test("student applications alias redirects to student applications page", async ({
    page,
  }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/applications")

    await expect(page).toHaveURL(/\/en\/dashboard\/student\/applications$/)
  })

  test("student explore alias redirects to student search page", async ({
    page,
  }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/explore")

    await expect(page).toHaveURL(/\/en\/dashboard\/student\/search$/)
  })

  test("explore detail alias redirects to student offer detail page", async ({
    page,
  }) => {
    const offer = await seedOfferFixture({
      titlePrefix: "Routing Alias Offer",
    })

    await loginAsStudent(page)
    await page.goto(`/en/dashboard/explore/${offer.offerId}`)

    await expect(page).toHaveURL(
      new RegExp(`/en/dashboard/student/offers/${offer.offerId}$`),
    )
  })

  test("company is redirected away from student applications alias", async ({
    page,
  }) => {
    await loginAsCompany(page)
    await page.goto("/en/dashboard/applications")

    await expect(page).toHaveURL(/\/en\/dashboard\/company$/)
  })
})
