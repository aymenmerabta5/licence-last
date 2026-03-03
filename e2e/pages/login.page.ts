import type { Page } from "@playwright/test"

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/en/login")
    await this.page.waitForSelector("#login-email", {
      state: "visible",
      timeout: 15000,
    })
  }

  async loginWithCredentials(email: string, password: string): Promise<void> {
    await this.goto()
    await this.page.fill("#login-email", email)
    await this.page.fill("#login-password", password)
    await this.page.click('button[type="submit"]')

    await this.page.waitForURL(/\/en\/(dashboard|status|onboarding|verify)/, {
      timeout: 45000,
    })

    await this.page.waitForSelector("main", {
      state: "visible",
      timeout: 15000,
    })
  }
}
