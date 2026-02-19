import { headers } from "next/headers"
import { StudentOnboardingForm } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding"
import { auth } from "@/lib/auth"
import { localeRedirect } from "@/lib/navigation"

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
