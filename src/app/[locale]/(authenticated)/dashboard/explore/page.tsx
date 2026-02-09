import { redirect } from "@/i18n/routing"

import { requireRole } from "@/lib/auth-guards"
import { ExploreClient } from "./_components/ExploreClient"

type Params = Promise<{ locale: string }>

export default async function ExplorePage({
  params,
}: {
  params: Params
}) {
  const [{ }, user] = await Promise.all([
    params,
    requireRole(["student"]),
  ])

  if (!user.onboardingCompleted) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect(`/onboarding/student` as any)
  }

  return <ExploreClient />
}
