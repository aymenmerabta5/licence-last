import { expect, test } from "@playwright/test"

import { loginAsAdmin } from "../fixtures/auth"

test.describe("Department Management", () => {
  test("can list departments", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/en/dashboard/admin/departments")

    await expect(
      page.getByRole("heading", { name: "Departments" }).last(),
    ).toBeVisible({ timeout: 15000 })
  })

  test("can see add department section", async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto("/en/dashboard/admin/departments")

    await expect(
      page.getByRole("heading", { name: "Departments" }).last(),
    ).toBeVisible({ timeout: 15000 })

    await expect(page.getByText("Add Department")).toBeVisible()
  })
})
