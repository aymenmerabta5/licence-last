import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"

export default async function ProfilePage() {
  const user = await requireRole(["student", "company_admin", "university_admin", "super_admin"])

  // Keep /dashboard/profile for backwards compatibility; the profile is now public at /profile/[userId].
  return localeRedirect(`/profile/${user.id}`)
}
