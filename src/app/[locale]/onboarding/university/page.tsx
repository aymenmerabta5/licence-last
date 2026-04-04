import { headers } from "next/headers"
import { Suspense } from "react"
import { UniversityOnboardingForm } from "@/app/[locale]/onboarding/university/_components/UniversityOnboardingForm"
import { getEffectiveRole } from "@/lib/effective-role"
import { localeRedirect } from "@/lib/navigation"
import { getFreshAuthSession } from "@/server/auth/get-fresh-session"
import { getUniversityStatusByUserId } from "@/server/services/universities/get-status"

export async function UniversityOnboardingPageContent() {
  const session = await getFreshAuthSession(await headers())
  const effectiveRole = getEffectiveRole({ role: session?.user.role })

  if (session && effectiveRole !== "university_admin") {
    if (effectiveRole === "student") {
      return localeRedirect("/onboarding/student")
    }

    if (effectiveRole === "company_admin") {
      return localeRedirect("/onboarding/company")
    }

    return localeRedirect("/dashboard")
  }

  if (session?.user.id) {
    const university = await getUniversityStatusByUserId(session.user.id)

    if (university?.status === "approved") {
      return localeRedirect("/dashboard")
    }

    if (university?.status === "rejected") {
      return localeRedirect("/status/university/rejected")
    }

    if (university) {
      return localeRedirect("/status/university/pending")
    }
  }

  if (session?.user.onboardingCompleted) {
    return localeRedirect("/status/university/pending")
  }

  return <UniversityOnboardingForm />
}

export default function UniversityOnboardingPage() {
  return (
    <Suspense fallback={null}>
      <UniversityOnboardingPageContent />
    </Suspense>
  )
}
