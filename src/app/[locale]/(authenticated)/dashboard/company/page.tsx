import { redirect } from "next/navigation"

import { getTranslations } from "next-intl/server"

import { requireRole } from "@/lib/auth-guards"
import { formatDateLong } from "@/lib/date"
import { getCompanyByUserId } from "@/server/services/companies/get"
import { RecruiterDashboard } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard"

type Params = Promise<{ locale: string }>

export default async function CompanyDashboardPage({
  params,
}: {
  params: Params
}) {
  const [{ locale }, user] = await Promise.all([
    params,
    requireRole(["company_admin"]),
  ])

  if (!user.onboardingCompleted) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect(`/${locale}/onboarding/company` as any)
  }

  const company = await getCompanyByUserId(user.id)

  if (company?.status === "rejected") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect(`/${locale}/dashboard/company/rejected` as any)
  }

  if (company?.status !== "approved") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect(`/${locale}/dashboard/company/pending` as any)
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

