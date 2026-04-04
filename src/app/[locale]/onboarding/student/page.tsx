import { headers } from "next/headers"
import { Suspense } from "react"
import { StudentOnboardingForm } from "@/app/[locale]/onboarding/student/_components/StudentOnboarding"
import { getEffectiveRole } from "@/lib/effective-role"
import { localeRedirect } from "@/lib/navigation"
import { getFreshAuthSession } from "@/server/auth/get-fresh-session"

export async function StudentOnboardingPageContent() {
  const session = await getFreshAuthSession(await headers())
  const effectiveRole = getEffectiveRole({ role: session?.user.role })

  if (session && effectiveRole !== "student") {
    if (effectiveRole === "company_admin") {
      return localeRedirect("/onboarding/company")
    }

    if (effectiveRole === "university_admin") {
      return localeRedirect("/onboarding/university")
    }

    return localeRedirect("/dashboard")
  }

  // If already onboarded, redirect to dashboard
  if (session?.user.onboardingCompleted) {
    return localeRedirect("/dashboard")
  }

  return <StudentOnboardingForm />
}

export default function StudentOnboardingPage() {
  return (
    <Suspense fallback={null}>
      <StudentOnboardingPageContent />
    </Suspense>
  )
}
