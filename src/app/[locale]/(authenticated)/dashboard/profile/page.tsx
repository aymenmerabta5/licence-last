import { Suspense } from "react"
import { requireRole } from "@/lib/auth-guards"
import { localeRedirect } from "@/lib/navigation"

async function ProfilePageContent() {
  const user = await requireRole([
    "student",
    "company_admin",
    "university_admin",
    "super_admin",
  ])

  // Keep /dashboard/profile for backwards compatibility; the profile is now public at /profile/[userId].
  return localeRedirect(`/profile/${user.id}`)
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageContent />
    </Suspense>
  )
}
