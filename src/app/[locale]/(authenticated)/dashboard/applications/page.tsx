import { redirect } from "next/navigation"

import { requireRole } from "@/lib/auth-guards"
import { ApplicationsClient } from "./_components/ApplicationsClient"

type Params = Promise<{ locale: string }>

export default async function ApplicationsPage({
  params,
}: {
  params: Params
}) {
  const [{ locale }, user] = await Promise.all([
    params,
    requireRole(["student"]),
  ])

  if (!user.onboardingCompleted) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect(`/${locale}/onboarding/student` as any)
  }

  return <ApplicationsClient />
}
