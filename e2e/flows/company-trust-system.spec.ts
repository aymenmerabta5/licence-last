import { expect, test } from "@playwright/test"

import { loginAsStudent } from "../fixtures/auth"
import { seedPlacementFixture, seedGeneratedDocument } from "../fixtures/seed"

test.describe("Company Trust System", () => {
  test("can view documents page with placement feedback", async ({ page }) => {
    const placement = await seedPlacementFixture()
    await seedGeneratedDocument({
      placementId: placement.placementId,
      type: "agreement",
      status: "generated",
    })

    await loginAsStudent(page)
    await page.goto("/en/dashboard/student/documents")

    await expect(
      page.getByRole("heading", { name: "My Documents" }),
    ).toBeVisible({ timeout: 15000 })
  })
})
