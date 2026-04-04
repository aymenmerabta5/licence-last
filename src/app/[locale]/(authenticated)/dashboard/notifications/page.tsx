import { Suspense } from "react"
import { NotificationsView } from "@/app/[locale]/(authenticated)/dashboard/notifications/_components/NotificationsView"
import { requireRole } from "@/lib/auth-guards"

async function NotificationsPageContent() {
  const user = await requireRole([
    "student",
    "company_admin",
    "university_admin",
    "super_admin",
  ])

  return (
    <div className="max-w-4xl mx-auto">
      <NotificationsView
        role={(user.role as string) ?? "student"}
        viewerId={user.id}
      />
    </div>
  )
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={null}>
      <NotificationsPageContent />
    </Suspense>
  )
}
