import { headers } from "next/headers"

import { localeRedirect } from "@/lib/navigation"
import { auth } from "@/lib/auth"
import { StudentOnboardingForm } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding"

export default async function StudentOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // If already onboarded, redirect to dashboard
  if (session?.user.onboardingCompleted) {
    return localeRedirect("/dashboard")
  }

  return <StudentOnboardingForm />
}
