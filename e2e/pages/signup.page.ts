import { expect, type Page } from "@playwright/test"

interface SignupInput {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export class SignupPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/en/signup")
  }

  async openStudentSignupForm(): Promise<void> {
    await this.goto()

    const studentButton = this.page.getByRole("button", { name: /student/i }).first()
    await expect(studentButton).toBeVisible()
    await studentButton.click()

    await expect(this.page.locator("#signup-email")).toBeVisible()
  }

  async fillRequiredFields(input: SignupInput): Promise<void> {
    await this.page.fill("#signup-name", input.name)
    await this.page.fill("#signup-email", input.email)
    await this.page.fill("#signup-password", input.password)
    await this.page.fill("#signup-confirm-password", input.confirmPassword)
    await this.page.check("#signup-terms")
  }

  async submit(): Promise<void> {
    await this.page.click('button[type="submit"]')
  }

  async goToLoginPage(): Promise<void> {
    await this.page.locator('a[href="/en/login"]').first().click()
  }
}