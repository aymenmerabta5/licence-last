import { Suspense } from "react"
import { requireRole } from "@/lib/auth-guards"
import { localeRedirect } from "@/lib/navigation"

async function StudentProfilePageContent() {
  const user = await requireRole(["student"])

  // Legacy route; the canonical profile route is /profile/[userId].
  return localeRedirect(`/profile/${user.id}`)
}

export default function StudentProfilePage() {
  return (
    <Suspense fallback={null}>
      <StudentProfilePageContent />
    </Suspense>
  )
}
