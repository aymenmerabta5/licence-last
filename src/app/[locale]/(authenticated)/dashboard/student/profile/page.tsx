import { requireRole } from "@/lib/auth-guards"
import { localeRedirect } from "@/lib/navigation"

export default async function StudentProfilePage() {
  const user = await requireRole(["student"])

  // Legacy route; the canonical profile route is /profile/[userId].
  return localeRedirect(`/profile/${user.id}`)
}
