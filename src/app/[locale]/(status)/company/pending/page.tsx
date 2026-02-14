import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"
import { formatDateLong } from "@/lib/date"
import { getCompanyByUserId } from "@/server/services/companies/get"

export default async function CompanyPendingPage() {
  const user = await requireRole(["company_admin"])
  const company = await getCompanyByUserId(user.id)

  if (!user.onboardingCompleted && !company) {
    return localeRedirect("/onboarding/company")
  }

  if (company?.status === "approved") {
    return localeRedirect("/dashboard/company")
  }

  if (company?.status === "rejected") {
    return localeRedirect("/status/company/rejected")
  }

  const t = await getTranslations("dashboard.company.pending")

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-primary [[dir=rtl]_&]:tracking-normal">
          {t("pageTitle")}
        </p>
        <h1 className="font-serif text-[clamp(2.25rem,4vw,3rem)] leading-tight tracking-tight text-heading">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed font-light max-w-2xl">
          {t("subtitle")}
        </p>
      </header>

      <Separator className="bg-border/60" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="rounded-none border border-border/60 bg-background/40 p-6 shadow-none">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground [[dir=rtl]_&]:tracking-normal">
            {t("submittedOn")}
          </p>
          <p className="mt-2 font-serif text-xl text-heading">
            {company?.createdAt ? formatDateLong(company.createdAt) : "—"}
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-background/40 p-6 shadow-none">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground [[dir=rtl]_&]:tracking-normal">
            {t("companyName")}
          </p>
          <p className="mt-2 font-serif text-xl text-heading">
            {company?.name ?? "—"}
          </p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a href="mailto:support@internex.io" className="w-full sm:w-auto">
          <Button
            variant="editorial-outline"
            size="editorial"
            className="w-full"
          >
            {t("contactSupport")}
          </Button>
        </a>
      </div>
    </div>
  )
}
