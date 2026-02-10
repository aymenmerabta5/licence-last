import { requireRole } from "@/lib/auth-guards"
import { NotificationsClient } from "./_components/NotificationsClient"

export default async function NotificationsPage() {
  const user = await requireRole(["student", "company_admin", "admin", "super_admin"])

  return (
    <div className="max-w-4xl mx-auto">
      <NotificationsClient role={(user.role as string) ?? "student"} />
    </div>
  )
}
