import { headers } from "next/headers"
import { UniversityOnboardingForm } from "@/app/[locale]/onboarding/university/_components/UniversityOnboardingForm"
import { auth } from "@/lib/auth"
import { localeRedirect } from "@/lib/navigation"

export default async function UniversityOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.user.onboardingCompleted) {
    return localeRedirect("/status/university/pending")
  }

  return <UniversityOnboardingForm />
}
