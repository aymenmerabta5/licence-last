import { redirect } from "next/navigation"

import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"
import { requireRole } from "@/lib/auth-guards"
import { formatDateLong } from "@/lib/date"
import { getCompanyByUserId } from "@/server/services/companies/get"

type Params = Promise<{ locale: string }>

export default async function CompanyPendingPage({ params }: { params: Params }) {
  const [{ locale }, user] = await Promise.all([
    params,
    requireRole(["company_admin"]),
  ])

  if (!user.onboardingCompleted) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect(`/${locale}/onboarding/company` as any)
  }

  const company = await getCompanyByUserId(user.id)

  if (company?.status === "approved") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect(`/${locale}/dashboard/company` as any)
  }

  if (company?.status === "rejected") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect(`/${locale}/dashboard/company/rejected` as any)
  }

  const t = await getTranslations("dashboard.company.pending")

  return (
    <div className="max-w-3xl mx-auto space-y-10">
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
        <Link href="/dashboard/company/profile" className="w-full sm:w-auto">
          <Button
            variant="editorial"
            size="editorial"
            className="w-full"
          >
            {t("checkStatus")}
          </Button>
        </Link>
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
