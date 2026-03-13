import { getTranslations } from "next-intl/server"
import { CompanyProfileForm } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm"
import { requireCompanyOwner } from "@/lib/dashboard-access"

export default async function CompanyProfilePage() {
  const [{ company, membership }, t] = await Promise.all([
    requireCompanyOwner(),
    getTranslations("dashboard.company.profile"),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Editorial masthead */}
      <div className="relative">
        <div className="h-0.5 bg-primary" />
        <div className="border border-t-0 border-border/50 p-8 md:p-10 relative overflow-hidden">
          {/* Dark mode glow */}
          <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100">
            <div className="absolute -top-20 end-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="relative flex items-start gap-6">
            <div className="space-y-2 min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary in-[[dir=rtl]]:tracking-normal">
                {t("title")}
              </span>
              <h1 className="font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.08] tracking-tight text-heading">
                {company.name}
              </h1>
              <p className="text-sm text-muted-foreground font-light max-w-lg">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <CompanyProfileForm
        initialData={{
          companyName: company.name,
          canDeleteCompany: membership?.role === "owner",
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
