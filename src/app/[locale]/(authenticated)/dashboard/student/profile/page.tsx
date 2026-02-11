import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"

export default async function StudentProfilePage() {
  const user = await requireRole(["student"])

  // Legacy route; the canonical profile route is /profile/[userId].
  return localeRedirect(`/profile/${user.id}`)
}
