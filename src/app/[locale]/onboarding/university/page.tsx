import { headers } from "next/headers"
import { UniversityOnboardingForm } from "@/app/[locale]/onboarding/university/_components/UniversityOnboardingForm"
import { auth } from "@/lib/auth"
import { localeRedirect } from "@/lib/navigation"
import { getUniversityStatusByUserId } from "@/server/services/universities/get-status"

export default async function UniversityOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

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
