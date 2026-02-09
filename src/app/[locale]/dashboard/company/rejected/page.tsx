import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { XCircle, Mail } from "lucide-react"

import { auth } from "@/lib/auth"
import { getCompanyByUserId } from "@/server/services/companies/get"

export default async function CompanyRejectedPage() {
  const t = await getTranslations("dashboard.company.rejected")

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
  if (company.status === "pending") redirect("/dashboard/company/pending" as any)

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center border-2 border-destructive/20 bg-destructive/5">
            <XCircle className="h-8 w-8 text-destructive" />
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

        {/* Rejection reason */}
        {company.rejectionReason && (
          <div className="border border-destructive/20 bg-destructive/5 p-4 text-start">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
              {t("reason")}
            </p>
            <p className="text-sm text-heading leading-relaxed">
              {company.rejectionReason}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <a
            href="mailto:support@internex.io"
            className="inline-flex items-center justify-center gap-2 h-11 border border-border text-sm font-medium text-heading hover:bg-muted/50 transition-colors duration-300"
          >
            <Mail className="h-4 w-4" />
            {t("contactSupport")}
          </a>
        </div>
      </div>
    </div>
  )
}
