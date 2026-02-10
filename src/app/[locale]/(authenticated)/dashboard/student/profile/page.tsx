import { redirect } from "next/navigation"

import { getLocale } from "next-intl/server"

import { requireRole } from "@/lib/auth-guards"

export default async function StudentProfilePage() {
  const user = await requireRole(["student"])
  const locale = await getLocale()

  // Legacy route; the canonical profile route is /profile/[userId].
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  redirect(`/${locale}/profile/${user.id}` as any)
}

