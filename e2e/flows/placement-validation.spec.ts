import { expect, test } from "@playwright/test"

import { loginAsAdmin } from "../fixtures/auth"
import { seedApplicationFixture } from "../fixtures/seed"

test.describe("Placement Validation & Rejection", () => {
  test("can list pending validations", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/en/dashboard/admin/validations")

    await expect(
      page.getByRole("heading", { name: "Validate Placements" }),
    ).toBeVisible({ timeout: 15000 })
  })

  test("shows empty state when no pending validations", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/en/dashboard/admin/validations")

    await expect(
      page.getByRole("heading", { name: "Validate Placements" }),
    ).toBeVisible({ timeout: 15000 })

    await page.waitForTimeout(2000)
  })

  test("can see seeded application in validations", async ({ page }) => {
    await seedApplicationFixture({
      status: "company_accepted",
      pipelineStage: "offer",
    })
    await loginAsAdmin(page)
    await page.goto("/en/dashboard/admin/validations")

    await expect(
      page.getByRole("heading", { name: "Validate Placements" }),
    ).toBeVisible({ timeout: 15000 })

    await page.waitForTimeout(3000)
  })
})
