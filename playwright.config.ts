import { defineConfig, devices } from "@playwright/test"

import { resolveE2EDatabaseUrl } from "./e2e/fixtures/database"

const reuseExistingServer =
  process.env.PLAYWRIGHT_REUSE_SERVER === "1" || !process.env.CI
const e2eDatabaseUrl = resolveE2EDatabaseUrl()

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  timeout: 60000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /global\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      name: "visual",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          args: ["--disable-animations"],
        },
      },
      dependencies: ["setup"],
      snapshotPathTemplate:
        "e2e/__snapshots__/visual/{testFileDir}/{testFileName}-{arg}{ext}",
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer,
    env: {
      ...process.env,
      DATABASE_URL: e2eDatabaseUrl,
      E2E_DATABASE_URL: e2eDatabaseUrl,
      E2E_DISABLE_CAPTCHA: "1",
      NEXT_PUBLIC_E2E_DISABLE_CAPTCHA: "true",
      E2E_DISABLE_CACHE: "1",
      RESEND_API_KEY: process.env.RESEND_API_KEY ?? "re_e2e_broken_test_key",
      EMAIL_FROM: process.env.EMAIL_FROM ?? "noreply@stag.test",
    },
  },
})
