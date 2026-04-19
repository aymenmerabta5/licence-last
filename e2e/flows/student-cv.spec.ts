import { expect, test } from "@playwright/test"

import { loginAsStudent } from "../fixtures/auth"

test.describe("Student CV — Experience", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/student/cv")
    await expect(page.getByText("CV Manager")).toBeVisible({ timeout: 15000 })
  })

  test("can create an experience entry", async ({ page }) => {
    await page.getByRole("button", { name: "Add", exact: true }).first().click()

    await page.fill('input[placeholder="Role title"]', "Software Intern")
    await page.fill('input[placeholder="Organization"]', "Test Corp")
    await page.fill('textarea[placeholder="Description"]', "Built E2E tests")
    await page.locator('input[type="date"]').first().fill("2025-01-01")

    await page.getByRole("button", { name: "Save", exact: true }).click()

    await expect(page.getByText("Software Intern")).toBeVisible({ timeout: 10000 })
    await expect(page.getByText("Test Corp")).toBeVisible()
  })

  test("can cancel experience creation", async ({ page }) => {
    await page.getByRole("button", { name: "Add", exact: true }).first().click()

    await page.fill('input[placeholder="Role title"]', "Should Not Persist")

    await page.getByRole("button", { name: "Cancel" }).first().click()

    await expect(page.getByText("Should Not Persist")).not.toBeVisible({ timeout: 5000 })
  })

  test("save button is disabled without required fields", async ({ page }) => {
    await page.getByRole("button", { name: "Add", exact: true }).first().click()

    await expect(
      page.getByRole("button", { name: "Save", exact: true }),
    ).toBeDisabled()
  })
})

test.describe("Student CV — Projects", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page)
    await page.goto("/en/dashboard/student/cv")
    await expect(page.getByText("CV Manager")).toBeVisible({ timeout: 15000 })
  })

  test("can create a project entry", async ({ page }) => {
    const addButtons = page.getByRole("button", { name: "Add", exact: true })
    await addButtons.nth(1).click()

    await page.fill('input[placeholder="Project name"]', "E2E Test Project")
    await page.fill('textarea[placeholder="Project summary"]', "A project for E2E testing")

    await page.getByRole("button", { name: "Save", exact: true }).click()

    await expect(page.getByText("E2E Test Project")).toBeVisible({ timeout: 10000 })
  })

  test("can cancel project creation", async ({ page }) => {
    const addButtons = page.getByRole("button", { name: "Add", exact: true })
    await addButtons.nth(1).click()

    await page.fill('input[placeholder="Project name"]', "Should Not Persist")

    await page.getByRole("button", { name: "Cancel" }).first().click()

    await expect(page.getByText("Should Not Persist")).not.toBeVisible({ timeout: 5000 })
  })

  test("save button is disabled without required fields", async ({ page }) => {
    const addButtons = page.getByRole("button", { name: "Add", exact: true })
    await addButtons.nth(1).click()

    await expect(
      page.getByRole("button", { name: "Save", exact: true }),
    ).toBeDisabled()
  })
})
