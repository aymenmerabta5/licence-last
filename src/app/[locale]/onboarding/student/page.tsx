import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getLocale } from "next-intl/server"

import { auth } from "@/lib/auth"
import { StudentOnboardingForm } from "./_components/StudentOnboarding"

export default async function StudentOnboardingPage() {
  const [session, locale] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    getLocale(),
  ])

  // If already onboarded, redirect to dashboard
  if (session?.user.onboardingCompleted) {
    redirect(`/${locale}/dashboard`)
  }

  return <StudentOnboardingForm />
}
