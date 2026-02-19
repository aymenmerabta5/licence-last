import { headers } from "next/headers"
import { CompanyOnboardingForm } from "@/app/[locale]/onboarding/company/_components/CompanyOnboardingForm"
import { auth } from "@/lib/auth"
import { localeRedirect } from "@/lib/navigation"

export default async function CompanyOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // If already onboarded, redirect to dashboard
  if (session?.user.onboardingCompleted) {
    return localeRedirect("/status/company/pending")
  }

  return <CompanyOnboardingForm />
}
