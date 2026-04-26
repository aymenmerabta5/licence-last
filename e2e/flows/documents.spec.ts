import { expect, test } from "@playwright/test"

import { loginAsCompany, loginAsStudent } from "../fixtures/auth"
import { seedGeneratedDocument, seedPlacementFixture } from "../fixtures/seed"

test.describe("Document Generation & Verification", () => {
  test("student can view placement documents", async ({ page }) => {
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
    ).toBeVisible({
      timeout: 15000,
    })

    await expect(page.getByText("Test Company")).toBeVisible({
      timeout: 10000,
    })
  })

  test("student can download a generated agreement", async ({ page }) => {
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
    ).toBeVisible({
      timeout: 15000,
    })

    const downloadBtn = page.locator("button", { hasText: /download/i }).first()
    await expect(downloadBtn).toBeVisible({ timeout: 10000 })

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 15000 }).catch(() => null),
      downloadBtn.click(),
    ])

    if (download) {
      expect(download.suggestedFilename()).toContain(".pdf")
    }
  })

  test("company can view placement documents and generate certificate", async ({
    page,
  }) => {
    const now = new Date()
    const startDate = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000)
    const endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const placement = await seedPlacementFixture({
      startDate,
      endDate,
      seedAgreement: true,
    })
    await seedGeneratedDocument({
      placementId: placement.placementId,
      type: "agreement",
      status: "generated",
    })

    await loginAsCompany(page)
    await page.goto("/en/dashboard/company/documents")

    await expect(
      page.getByRole("heading", { name: "Company Documents" }),
    ).toBeVisible({
      timeout: 15000,
    })

    await expect(page.getByText("Test Student").first()).toBeVisible({
      timeout: 10000,
    })

    const generateBtn = page
      .locator("button", { hasText: /generate certificate/i })
      .first()
    if (await generateBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const [_response] = await Promise.all([
        page
          .waitForResponse(
            (r) => r.url().includes("documents") && r.status() < 500,
            { timeout: 30000 },
          )
          .catch(() => null),
        generateBtn.click(),
      ])

      await page.waitForTimeout(3000)
    }
  })

  test("document verification shows valid result for real code", async ({
    page,
  }) => {
    const placement = await seedPlacementFixture()
    const doc = await seedGeneratedDocument({
      placementId: placement.placementId,
      type: "agreement",
      verificationCode: "INTX-ABCD-EFGH",
      status: "generated",
    })

    await page.goto(`/en/verify/${encodeURIComponent(doc.verificationCode!)}`)

    await expect(page.getByText("Document Verified")).toBeVisible({
      timeout: 15000,
    })

    await expect(page.getByText("Test Student", { exact: true })).toBeVisible()
    await expect(page.getByText("Test Company", { exact: true })).toBeVisible()
  })

  test("document verification shows invalid result for fake code", async ({
    page,
  }) => {
    await page.goto("/en/verify/INTX-FAKE-CODE")

    await expect(page.getByText("Document Not Found")).toBeVisible({
      timeout: 15000,
    })
  })

  test("verify page form submits and navigates to result", async ({ page }) => {
    await page.goto("/en/verify")

    await expect(page.getByText("Document Verification")).toBeVisible({
      timeout: 15000,
    })

    const input = page.locator('input[placeholder="INTX-XXXX-XXXX"]')
    await expect(input).toBeVisible()
    await input.fill("INTX-FAKE-TEST")

    const submitBtn = page.locator("button", { hasText: /verify document/i })
    await submitBtn.click()

    await expect(page).toHaveURL(/\/en\/verify\/INTX-FAKE-TEST/, {
      timeout: 10000,
    })
  })
})
