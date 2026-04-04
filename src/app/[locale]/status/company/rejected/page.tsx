import { Suspense } from "react"
import { getLocale, getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { requireRole } from "@/lib/auth-guards"
import { formatDateLong } from "@/lib/date"
import { localeRedirect } from "@/lib/navigation"
import { getCompanyByUserId } from "@/server/services/companies/get"
import { getCompanyStatusByUserId } from "@/server/services/companies/get-status"

export async function CompanyRejectedPageContent() {
  const user = await requireRole(["company_admin"], { allowUnapproved: true })
  const companyStatus = await getCompanyStatusByUserId(user.id)

  if (!companyStatus) {
    return localeRedirect("/onboarding/company")
  }

  if (companyStatus.status === "approved") {
    return localeRedirect("/dashboard")
  }

  if (companyStatus.status === "suspended") {
    return localeRedirect("/status/company/suspended")
  }

  if (companyStatus.status !== "rejected") {
    return localeRedirect("/status/company/pending")
  }

  const company = await getCompanyByUserId(user.id)
  const [locale, t, tp] = await Promise.all([
    getLocale(),
    getTranslations("dashboard.company.rejected"),
    getTranslations("dashboard.company.pending"),
  ])

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-destructive [[dir=rtl]_&]:tracking-normal">
          {t("pageTitle")}
        </p>
        <h1 className="font-serif text-[clamp(2.25rem,4vw,3rem)] leading-tight tracking-tight text-heading">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-sm font-light leading-relaxed text-muted-foreground">
          {t("subtitle")}
        </p>
      </header>

      <Separator className="bg-border/60" />

      <Card className="space-y-5 rounded-none border border-border/60 bg-background/40 p-6 shadow-none">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
              {t("reason")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              {company?.rejectionReason ?? companyStatus.rejectionReason ?? "-"}
            </p>
          </div>

          <div className="sm:text-end">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
              {tp("submittedOn")}
            </p>
            <p className="mt-2 font-serif text-lg text-heading">
              {company?.createdAt ? formatDateLong(company.createdAt, locale) : "-"}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="editorial-outline"
          size="editorial"
          className="w-full sm:w-auto"
          nativeButton={false}
          render={<a href="mailto:support@stag.io">{t("contactSupport")}</a>}
        />
      </div>
    </div>
  )
}

export default function CompanyRejectedPage() {
  return (
    <Suspense fallback={null}>
      <CompanyRejectedPageContent />
    </Suspense>
  )
}
