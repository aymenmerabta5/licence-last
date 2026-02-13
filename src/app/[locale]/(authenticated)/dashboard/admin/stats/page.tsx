import { requireRole } from "@/lib/auth-guards"
import { AdminStatsView } from "./_components/AdminStatsView"

export default async function AdminStatsPage() {
  await requireRole(["university_admin", "super_admin"])

  return (
    <div className="max-w-6xl mx-auto">
      <AdminStatsView />
    </div>
  )
}
