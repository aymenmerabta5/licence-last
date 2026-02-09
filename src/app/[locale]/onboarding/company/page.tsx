import { redirect } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { CompanyOnboardingForm } from "./_components/CompanyOnboardingForm"

export default async function CompanyOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // If already onboarded, redirect to dashboard
  if (session?.user.onboardingCompleted) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect("/dashboard/company/pending" as any)
  }

  return <CompanyOnboardingForm />
}
