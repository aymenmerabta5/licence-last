import { redirect } from "next/navigation"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { StudentOnboardingForm } from "./_components/StudentOnboardingForm"

export default async function StudentOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // If already onboarded, redirect to dashboard
  if (session?.user.onboardingCompleted) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect("/dashboard" as any)
  }

  return <StudentOnboardingForm />
}
