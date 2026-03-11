import { expect, test, type Page } from "@playwright/test"

import {
  loginAsAdmin,
  loginAsCompany,
  loginAsDeptHead,
  loginAsStudent,
  loginAsSuperAdmin,
} from "../fixtures/auth"

async function expectDashboardPageReady(
  page: Page,
  pathPattern: RegExp,
): Promise<void> {
  await expect(page).toHaveURL(pathPattern)
  await expect(page.locator("main")).toBeVisible()
  await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 })
}

async function expectRedirectToRoleHome(
  page: Page,
  roleHomePattern: RegExp,
): Promise<void> {
  await expect(page).toHaveURL(roleHomePattern)
  await expect(page.locator("main")).toBeVisible()
}

test.describe("Dashboard Smoke Coverage", () => {
  test.describe("Student", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsStudent(page)
    })

    test("student dashboard loads", async ({ page }) => {
      await page.goto("/en/dashboard")
      await expectDashboardPageReady(page, /\/en\/dashboard$/)
    })

    test("student search page loads", async ({ page }) => {
      await page.goto("/en/dashboard/student/search")
      await expectDashboardPageReady(page, /\/en\/dashboard\/student\/search$/)
    })

    test("student applications page loads", async ({ page }) => {
      await page.goto("/en/dashboard/student/applications")
      await expectDashboardPageReady(
        page,
        /\/en\/dashboard\/student\/applications$/,
      )
    })

    test("student cv page loads", async ({ page }) => {
      await page.goto("/en/dashboard/student/cv")
      await expectDashboardPageReady(page, /\/en\/dashboard\/student\/cv$/)
    })

    test("student companies page loads", async ({ page }) => {
      await page.goto("/en/dashboard/student/companies")
      await expectDashboardPageReady(
        page,
        /\/en\/dashboard\/student\/companies$/,
      )
    })

    test("student documents page loads", async ({ page }) => {
      await page.goto("/en/dashboard/student/documents")
      await expectDashboardPageReady(
        page,
        /\/en\/dashboard\/student\/documents$/,
      )
    })

    test("student saved offers page loads", async ({ page }) => {
      await page.goto("/en/dashboard/student/saved-offers")
      await expectDashboardPageReady(
        page,
        /\/en\/dashboard\/student\/saved-offers$/,
      )
    })

    test("student explore alias redirects to search", async ({ page }) => {
      await page.goto("/en/dashboard/explore")
      await expectDashboardPageReady(page, /\/en\/dashboard\/student\/search$/)
    })

    test("student cannot access company dashboard", async ({ page }) => {
      await page.goto("/en/dashboard/company")
      await expectRedirectToRoleHome(page, /\/en\/dashboard\/student$/)
    })
  })

  test.describe("Company", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsCompany(page)
    })

    test("company dashboard loads", async ({ page }) => {
      await page.goto("/en/dashboard/company")
      await expectDashboardPageReady(page, /\/en\/dashboard\/company$/)
    })

    test("company offers page loads", async ({ page }) => {
      await page.goto("/en/dashboard/company/offers")
      await expectDashboardPageReady(page, /\/en\/dashboard\/company\/offers$/)
    })

    test("company candidates page loads", async ({ page }) => {
      await page.goto("/en/dashboard/candidates")
      await expectDashboardPageReady(page, /\/en\/dashboard\/candidates$/)
    })

    test("company profile page loads", async ({ page }) => {
      await page.goto("/en/dashboard/company/profile")
      await expectDashboardPageReady(page, /\/en\/dashboard\/company\/profile$/)
    })

    test("company team page loads", async ({ page }) => {
      await page.goto("/en/dashboard/company/team")
      await expectDashboardPageReady(page, /\/en\/dashboard\/company\/team$/)
    })

    test("company documents page loads", async ({ page }) => {
      await page.goto("/en/dashboard/company/documents")
      await expectDashboardPageReady(
        page,
        /\/en\/dashboard\/company\/documents$/,
      )
    })

    test("company new offer page loads", async ({ page }) => {
      await page.goto("/en/dashboard/company/offers/new")
      await expectDashboardPageReady(
        page,
        /\/en\/dashboard\/company\/offers\/new$/,
      )
    })

    test("company assistant page loads", async ({ page }) => {
      await page.goto("/en/dashboard/assistant")
      await expectDashboardPageReady(page, /\/en\/dashboard\/assistant$/)
    })

    test("company cannot access admin validations", async ({ page }) => {
      await page.goto("/en/dashboard/admin/validations")
      await expectRedirectToRoleHome(page, /\/en\/dashboard\/company$/)
    })
  })

  test.describe("University Admin", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
    })

    test("admin dashboard loads", async ({ page }) => {
      await page.goto("/en/dashboard/admin")
      await expectDashboardPageReady(page, /\/en\/dashboard\/admin$/)
    })

    test("admin validations page loads", async ({ page }) => {
      await page.goto("/en/dashboard/admin/validations")
      await expectDashboardPageReady(
        page,
        /\/en\/dashboard\/admin\/validations$/,
      )
    })

    test("admin departments page loads", async ({ page }) => {
      await page.goto("/en/dashboard/admin/departments")
      await expectDashboardPageReady(
        page,
        /\/en\/dashboard\/admin\/departments$/,
      )
    })

    test("admin users page loads", async ({ page }) => {
      await page.goto("/en/dashboard/admin/users")
      await expectDashboardPageReady(page, /\/en\/dashboard\/admin\/users$/)
    })

    test("admin cannot access company dashboard", async ({ page }) => {
      await page.goto("/en/dashboard/company")
      await expectRedirectToRoleHome(page, /\/en\/dashboard\/admin$/)
    })
  })

  test.describe("Department Head", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsDeptHead(page)
    })

    test("dept head dashboard loads", async ({ page }) => {
      await page.goto("/en/dashboard")
      await expectDashboardPageReady(page, /\/en\/dashboard$/)
    })

    test("dept head validations page loads", async ({ page }) => {
      await page.goto("/en/dashboard/dept-validations")
      await expectDashboardPageReady(page, /\/en\/dashboard\/dept-validations$/)
    })

    test("dept head notifications page loads", async ({ page }) => {
      await page.goto("/en/dashboard/notifications")
      await expectDashboardPageReady(page, /\/en\/dashboard\/notifications$/)
    })

    test("dept head cannot access admin validations", async ({ page }) => {
      await page.goto("/en/dashboard/admin/validations")
      await expectRedirectToRoleHome(page, /\/en\/dashboard$/)
    })
  })

  test.describe("Super Admin", () => {
    test.beforeEach(async ({ page }) => {
      await loginAsSuperAdmin(page)
    })

    test("super admin dashboard loads", async ({ page }) => {
      await page.goto("/en/dashboard/admin")
      await expectDashboardPageReady(page, /\/en\/dashboard\/admin$/)
    })

    test("super admin stats page loads", async ({ page }) => {
      await page.goto("/en/dashboard/admin/stats")
      await expectDashboardPageReady(page, /\/en\/dashboard\/admin\/stats$/)
    })

    test("super admin companies page loads", async ({ page }) => {
      await page.goto("/en/dashboard/admin/companies")
      await expectDashboardPageReady(page, /\/en\/dashboard\/admin\/companies$/)
    })

    test("super admin universities page loads", async ({ page }) => {
      await page.goto("/en/dashboard/admin/universities")
      await expectDashboardPageReady(
        page,
        /\/en\/dashboard\/admin\/universities$/,
      )
    })

    test("super admin users page loads", async ({ page }) => {
      await page.goto("/en/dashboard/admin/users")
      await expectDashboardPageReady(page, /\/en\/dashboard\/admin\/users$/)
    })

    test("super admin cannot access university-only validations", async ({
      page,
    }) => {
      await page.goto("/en/dashboard/admin/validations")
      await expectRedirectToRoleHome(page, /\/en\/dashboard\/admin$/)
    })

    test("super admin cannot access company dashboard", async ({ page }) => {
      await page.goto("/en/dashboard/company")
      await expectRedirectToRoleHome(page, /\/en\/dashboard\/admin$/)
    })
  })
})
