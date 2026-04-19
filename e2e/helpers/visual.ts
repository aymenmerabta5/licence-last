import { expect, type Page } from "@playwright/test"

export async function waitForPageStable(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout: 15000 })
  await page.waitForTimeout(500)
}

export async function expectVisualMatch(
  page: Page,
  name: string,
): Promise<void> {
  await waitForPageStable(page)
  await expect(page).toHaveScreenshot(`${name}.png`, {
    maxDiffPixelRatio: 0.02,
    threshold: 0.2,
    animations: "disabled",
    caret: "hide",
    scale: "css",
  })
}
