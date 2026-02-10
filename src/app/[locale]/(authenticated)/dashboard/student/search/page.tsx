import type { Route } from "next"

import { redirect } from "next/navigation"

import { requireRole } from "@/lib/auth-guards"
import { ExploreClient } from "@/app/[locale]/(authenticated)/dashboard/explore/_components/ExploreClient"

type Params = Promise<{ locale: string }>

export default async function StudentSearchPage({
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

  return <ExploreClient />
}
