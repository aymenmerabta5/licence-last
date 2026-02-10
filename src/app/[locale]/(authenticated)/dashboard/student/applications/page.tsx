import type { Route } from "next"

import { redirect } from "next/navigation"

import { requireRole } from "@/lib/auth-guards"
import { ApplicationsClient } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsClient"

type Params = Promise<{ locale: string }>

export default async function StudentApplicationsPage({
  params,
}: {
  params: Params
}) {
  const [{ locale }, user] = await Promise.all([
    params,
    requireRole(["student"]),
  ])

  if (!user.onboardingCompleted) {
    redirect(`/${locale}/onboarding/student` as Route)
  }

  return <ApplicationsClient />
}
