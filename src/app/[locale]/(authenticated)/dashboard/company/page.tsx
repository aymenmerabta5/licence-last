import { getTranslations } from "next-intl/server"
import { RecruiterDashboard } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard"
import { requireRole } from "@/lib/auth-guards"
import { formatDateLong } from "@/lib/date"
import { localeRedirect } from "@/lib/navigation"
import { getCompanyByUserId } from "@/server/services/companies/get"

export default async function CompanyDashboardPage() {
  const user = await requireRole(["company_admin"])
  const company = await getCompanyByUserId(user.id)

  // AuthenticatedContent already blocks unapproved users — this is a safety net
  if (!company || company.status !== "approved") {
    return localeRedirect("/status/company/pending")
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
          <span className="text-foreground/70">
            {formatDateLong(company.createdAt)}
          </span>
          , currently{" "}
          <span className="text-foreground/70">{company.status}</span>.
        </p>
      </header>

      <RecruiterDashboard user={{ ...user, role: user.role as string }} />
    </div>
  )
}
