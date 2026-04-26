import { describe, expect, test } from "bun:test"
import { render } from "@react-email/render"

import CompanyApprovedEmail from "@/server/email/templates/CompanyApprovedEmail"
import CompanyRejectedEmail from "@/server/email/templates/CompanyRejectedEmail"
import DeptHeadWelcomeEmail from "@/server/email/templates/DeptHeadWelcomeEmail"
import ResetPasswordEmail from "@/server/email/templates/ResetPasswordEmail"
import UniversityApprovedEmail from "@/server/email/templates/UniversityApprovedEmail"
import VerifyEmailEmail from "@/server/email/templates/VerifyEmailEmail"

describe("src/server/email/templates", () => {
  test("verify/signup email template renders branding and verification link", async () => {
    const html = await render(
      <VerifyEmailEmail link="https://stag.test/verify?token=abc" />,
    )

    expect(html).toContain("Stag")
    expect(html).toContain("Verify your email")
    expect(html).toContain("https://stag.test/verify?token=abc")
  })

  test("reset password email template renders branding and reset link", async () => {
    const html = await render(
      <ResetPasswordEmail link="https://stag.test/reset?token=abc" />,
    )

    expect(html).toContain("Stag")
    expect(html).toContain("Reset your password")
    expect(html).toContain("https://stag.test/reset?token=abc")
  })

  test("department invite email template renders recipient and setup link", async () => {
    const html = await render(
      <DeptHeadWelcomeEmail
        name="Aymen"
        departmentName="Computer Science"
        universityName="Stag University"
        link="https://stag.test/set-password?token=abc"
      />,
    )

    expect(html).toContain("Department Head")
    expect(html).toContain("Computer Science")
    expect(html).toContain("Stag University")
    expect(html).toContain("https://stag.test/set-password?token=abc")
  })

  test("company approved/rejected templates render decision content", async () => {
    const approvedHtml = await render(
      <CompanyApprovedEmail
        companyName="Acme Corp"
        dashboardUrl="https://stag.test/dashboard"
      />,
    )
    const rejectedHtml = await render(
      <CompanyRejectedEmail
        companyName="Acme Corp"
        reason="Insufficient verification documents"
      />,
    )

    expect(approvedHtml).toContain("Acme Corp")
    expect(approvedHtml).toContain("Go to Dashboard")
    expect(approvedHtml).toContain("https://stag.test/dashboard")
    expect(rejectedHtml).toContain("Application not approved")
    expect(rejectedHtml).toContain("Insufficient verification documents")
  })

  test("university approved template renders dashboard access details", async () => {
    const html = await render(
      <UniversityApprovedEmail
        universityName="Stag University"
        dashboardUrl="https://stag.test/dashboard"
      />,
    )

    expect(html).toContain("Your university has been approved")
    expect(html).toContain("Stag University")
    expect(html).toContain("https://stag.test/dashboard")
  })
})
