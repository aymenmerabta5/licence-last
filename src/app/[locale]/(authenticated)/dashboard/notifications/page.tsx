import { NotificationsView } from "@/app/[locale]/(authenticated)/dashboard/notifications/_components/NotificationsView"
import { requireRole } from "@/lib/auth-guards"

export default async function NotificationsPage() {
  const user = await requireRole([
    "student",
    "company_admin",
    "university_admin",
    "super_admin",
  ])

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 md:px-0 space-y-10">
      <NotificationsView
        role={(user.role as string) ?? "student"}
        viewerId={user.id}
      />
    </div>
  )
}
