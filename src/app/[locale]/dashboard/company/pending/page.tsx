import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Clock, Building2, RefreshCw } from "lucide-react"

import { auth } from "@/lib/auth"
import { getCompanyByUserId } from "@/server/services/companies/get"

export default async function CompanyPendingPage() {
  const t = await getTranslations("dashboard.company.pending")

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect("/login")

  const company = await getCompanyByUserId(session.user.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!company) redirect("/onboarding/company" as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (company.status === "approved") redirect("/dashboard/company" as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (company.status === "rejected") redirect("/dashboard/company/rejected" as any)

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center border-2 border-primary/20 bg-primary/5">
            <Clock className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h1 className="font-serif text-2xl text-heading tracking-tight transition-colors duration-500">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Company info */}
        <div className="border border-border p-4 space-y-2 text-sm text-start">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] uppercase tracking-wide">
              {t("companyName")}
            </span>
            <span className="font-medium text-heading flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {company.name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] uppercase tracking-wide">
              {t("submittedOn")}
            </span>
            <span className="font-medium text-heading">
              {company.createdAt.toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <a
            href=""
            className="inline-flex items-center justify-center gap-2 h-11 border border-border text-sm font-medium text-heading hover:bg-muted/50 transition-colors duration-300"
          >
            <RefreshCw className="h-4 w-4" />
            {t("checkStatus")}
          </a>
        </div>
      </div>
    </div>
  )
}
