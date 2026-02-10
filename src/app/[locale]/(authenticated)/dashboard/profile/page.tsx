import { redirect } from "next/navigation"

import { getLocale } from "next-intl/server"

import { requireRole } from "@/lib/auth-guards"

export default async function ProfilePage() {
  const user = await requireRole(["student", "company_admin", "admin", "super_admin"])
  const locale = await getLocale()

  // Keep /dashboard/profile for backwards compatibility; the profile is now public at /profile/[userId].
  redirect(`/${locale}/profile/${user.id}`)
}
