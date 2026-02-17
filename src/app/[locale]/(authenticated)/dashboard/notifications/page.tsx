import { requireRole } from "@/lib/auth-guards"
import { NotificationsView } from "@/app/[locale]/(authenticated)/dashboard/notifications/_components/NotificationsView"

export default async function NotificationsPage() {
  const user = await requireRole(["student", "company_admin", "university_admin", "super_admin"])

  return (
    <div className="max-w-4xl mx-auto">
      <NotificationsView role={(user.role as string) ?? "student"} />
    </div>
  )
}
