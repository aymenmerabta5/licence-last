import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"

import { StudentCvView } from "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView"

export default async function StudentCvPage() {
  const user = await requireRole(["student"])

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/student")
  }

  return <StudentCvView />
}
