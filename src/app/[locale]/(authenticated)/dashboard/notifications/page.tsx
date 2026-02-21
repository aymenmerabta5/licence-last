import { NotificationsView } from "@/app/[locale]/(authenticated)/dashboard/notifications/_components/NotificationsView"
import { requireRole } from "@/lib/auth-guards"

export default async function NotificationsPage() {
  const user = await requireRole([
    "student",
    "company_admin",
    "dept_head",
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
