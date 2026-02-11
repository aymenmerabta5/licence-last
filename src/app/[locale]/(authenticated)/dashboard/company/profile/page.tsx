import { getTranslations } from "next-intl/server"

import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"
import { getCompanyByUserId } from "@/server/services/companies/get"
import { CompanyProfileForm } from "./_components/CompanyProfileForm"

export default async function CompanyProfilePage() {
  const [sessionUser, t] = await Promise.all([
    requireRole(["company_admin"]),
    getTranslations("dashboard.company.profile"),
  ])

  const company = await getCompanyByUserId(sessionUser.id)

  if (!company) {
    return localeRedirect("/onboarding/company")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground font-light">
          {t("subtitle")}
        </p>
      </div>

      <CompanyProfileForm
        initialData={{
          description: company.description ?? "",
          logoUrl: company.logoUrl ?? "",
          websiteUrl: company.websiteUrl ?? "",
          phone: company.phone ?? "",
          contactEmail: company.contactEmail ?? "",
          representativeName: company.representativeName ?? "",
          wilayaCode: company.wilayaCode ?? 0,
          address: company.address ?? "",
        }}
      />
    </div>
  )
}
