import { headers } from "next/headers"
import { Suspense } from "react"
import { CompanyOnboardingForm } from "@/app/[locale]/onboarding/company/_components/CompanyOnboardingForm"
import { getEffectiveRole } from "@/lib/effective-role"
import { localeRedirect } from "@/lib/navigation"
import { getFreshAuthSession } from "@/server/auth/get-fresh-session"
import { getCompanyStatusByUserId } from "@/server/services/companies/get-status"

export async function CompanyOnboardingPageContent() {
  const session = await getFreshAuthSession(await headers())
  const effectiveRole = getEffectiveRole({ role: session?.user.role })

  if (session && effectiveRole !== "company_admin") {
    if (effectiveRole === "student") {
      return localeRedirect("/onboarding/student")
    }

    if (effectiveRole === "university_admin") {
      return localeRedirect("/onboarding/university")
    }

    return localeRedirect("/dashboard")
  }

  if (session?.user.id) {
    const company = await getCompanyStatusByUserId(session.user.id)

    if (company?.status === "approved") {
      return localeRedirect("/dashboard")
    }

    if (company?.status === "rejected") {
      return localeRedirect("/status/company/rejected")
    }

    if (company?.status === "suspended") {
      return localeRedirect("/status/company/suspended")
    }

    if (company) {
      return localeRedirect("/status/company/pending")
    }
  }

  // Preserve existing fallback for users with stale onboarding flag but no status record.
  if (session?.user.onboardingCompleted) {
    return localeRedirect("/status/company/pending")
  }

  return <CompanyOnboardingForm />
}

export default function CompanyOnboardingPage() {
  return (
    <Suspense fallback={null}>
      <CompanyOnboardingPageContent />
    </Suspense>
  )
}
