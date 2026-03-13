import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { requireRole } from "@/lib/auth-guards"
import { formatDateLong } from "@/lib/date"
import { localeRedirect } from "@/lib/navigation"
import { getCompanyByUserId } from "@/server/services/companies/get"
import { getCompanyStatusByUserId } from "@/server/services/companies/get-status"

export default async function CompanySuspendedPage() {
  const user = await requireRole(["company_admin"], { allowUnapproved: true })
  const companyStatus = await getCompanyStatusByUserId(user.id)

  if (!companyStatus) {
    return localeRedirect("/onboarding/company")
  }

  if (companyStatus.status === "approved") {
    return localeRedirect("/dashboard")
  }

  if (companyStatus.status === "rejected") {
    return localeRedirect("/status/company/rejected")
  }

  if (companyStatus.status !== "suspended") {
    return localeRedirect("/status/company/pending")
  }

  const company = await getCompanyByUserId(user.id)
  const suspensionReason =
    company?.rejectionReason?.trim() ||
    companyStatus.rejectionReason?.trim() ||
    "-"

  const [t, tp, tr] = await Promise.all([
    getTranslations("dashboard.company.suspended"),
    getTranslations("dashboard.company.pending"),
    getTranslations("dashboard.company.rejected"),
  ])

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-orange-600 [[dir=rtl]_&]:tracking-normal">
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

      <Card className="rounded-none border border-border/60 bg-background/40 p-6 shadow-none space-y-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground [[dir=rtl]_&]:tracking-normal">
            {tr("reason")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">
            {suspensionReason}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground [[dir=rtl]_&]:tracking-normal">
              {tp("companyName")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              {company?.name ?? "-"}
            </p>
          </div>

          <div className="sm:text-end">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground [[dir=rtl]_&]:tracking-normal">
              {tp("submittedOn")}
            </p>
            <p className="mt-2 font-serif text-lg text-heading">
              {company?.createdAt ? formatDateLong(company.createdAt) : "-"}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="editorial-outline"
          size="editorial"
          className="w-full sm:w-auto"
          nativeButton={false}
          render={
            <a href="mailto:support@stag.io" aria-label={t("contactSupport")}>
              <span className="sr-only">{t("contactSupport")}</span>
            </a>
          }
        >
          {t("contactSupport")}
        </Button>
      </div>
    </div>
  )
}
