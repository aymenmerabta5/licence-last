import { getTranslations } from "next-intl/server"

import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"
import { formatDateLong } from "@/lib/date"
import { getCompanyByUserId } from "@/server/services/companies/get"
import { RecruiterDashboard } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard"

export default async function CompanyDashboardPage() {
  const user = await requireRole(["company_admin"])

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/company")
  }

  const company = await getCompanyByUserId(user.id)

  if (company?.status === "rejected") {
    return localeRedirect("/dashboard/company/rejected")
  }

  if (company?.status !== "approved") {
    return localeRedirect("/dashboard/company/pending")
  }

  const t = await getTranslations("dashboard")
  const greeting = t("welcome")

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header className="space-y-2">
        <h1 className="font-serif text-[clamp(2.5rem,5vw,3.5rem)] leading-none tracking-tight text-heading">
          {greeting}{" "}
          <span className="text-primary">
            {user.name?.split(" ")[0] || "User"}
          </span>
        </h1>
        <p className="text-muted-foreground text-sm font-light tracking-wide max-w-2xl">
          Company portal is live. Submitted{" "}
          <span className="text-foreground/70">{formatDateLong(company.createdAt)}</span>
          , currently{" "}
          <span className="text-foreground/70">{company.status}</span>.
        </p>
      </header>

      <RecruiterDashboard user={user} />
    </div>
  )
}

