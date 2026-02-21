import { headers } from "next/headers"
import { CompanyOnboardingForm } from "@/app/[locale]/onboarding/company/_components/CompanyOnboardingForm"
import { auth } from "@/lib/auth"
import { localeRedirect } from "@/lib/navigation"
import { getCompanyStatusByUserId } from "@/server/services/companies/get-status"

export default async function CompanyOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.user.id) {
    const company = await getCompanyStatusByUserId(session.user.id)

    if (company?.status === "approved") {
      return localeRedirect("/dashboard/company")
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
