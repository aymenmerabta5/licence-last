import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import { CompanyProfileForm } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm"
import { Skeleton } from "@/components/ui/skeleton"
import { requireCompanyOwner } from "@/lib/dashboard-access"

function CompanyProfileFallback() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <div className="space-y-4">
        <Skeleton className="h-0.5 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}

async function CompanyProfilePageContent() {
  const [{ company, membership }, t] = await Promise.all([
    requireCompanyOwner(),
    getTranslations("dashboard.company.profile"),
  ])

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Editorial masthead */}
      <header className="space-y-4">
        <div className="h-0.5 bg-primary" />

        <div className="space-y-3">
          <div className="space-y-2">
            <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
              {company.name}
            </h1>
            <p className="text-sm font-light text-muted-foreground max-w-lg">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl">
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
    </div>
  )
}

export default function CompanyProfilePage() {
  return (
    <Suspense fallback={<CompanyProfileFallback />}>
      <CompanyProfilePageContent />
    </Suspense>
  )
}
