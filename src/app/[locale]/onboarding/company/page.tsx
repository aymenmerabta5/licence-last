import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { localeRedirect } from "@/lib/navigation"
import { CompanyOnboardingForm } from "./_components/CompanyOnboardingForm"

export default async function CompanyOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // If already onboarded, redirect to dashboard
  if (session?.user.onboardingCompleted) {
    return localeRedirect("/dashboard/company/pending")
  }

  return <CompanyOnboardingForm />
}
