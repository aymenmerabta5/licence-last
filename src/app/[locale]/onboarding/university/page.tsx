import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { localeRedirect } from "@/lib/navigation"
import { UniversityOnboardingForm } from "@/app/[locale]/onboarding/university/_components/UniversityOnboardingForm"

export default async function UniversityOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.user.onboardingCompleted) {
    return localeRedirect("/status/university/pending")
  }

  return <UniversityOnboardingForm />
}
