import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"
import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"
import { formatDateLong } from "@/lib/date"
import { getCompanyByUserId } from "@/server/services/companies/get"

export default async function CompanyRejectedPage() {
  const user = await requireRole(["company_admin"])

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/company")
  }

  const company = await getCompanyByUserId(user.id)

  if (company?.status === "approved") {
    return localeRedirect("/dashboard/company")
  }

  if (company?.status !== "rejected") {
    return localeRedirect("/dashboard/company/pending")
  }

  const [t, tp] = await Promise.all([
    getTranslations("dashboard.company.rejected"),
    getTranslations("dashboard.company.pending"),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-destructive [[dir=rtl]_&]:tracking-normal">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground [[dir=rtl]_&]:tracking-normal">
              {t("reason")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              {company.rejectionReason || "—"}
            </p>
          </div>

          <div className="sm:text-end">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground [[dir=rtl]_&]:tracking-normal">
              {tp("submittedOn")}
            </p>
            <p className="mt-2 font-serif text-lg text-heading">
              {formatDateLong(company.createdAt)}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="editorial"
          size="editorial"
          className="w-full sm:w-auto"
          nativeButton={false}
          render={<Link href="/dashboard/company/profile" />}
        >
          {t("reapply")}
        </Button>
        <Button
          variant="editorial-outline"
          size="editorial"
          className="w-full sm:w-auto"
          nativeButton={false}
          render={<a href="mailto:support@internex.io" />}
        >
          {t("contactSupport")}
        </Button>
      </div>
    </div>
  )
}
