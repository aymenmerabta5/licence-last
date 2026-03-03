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
    },
  },
})
