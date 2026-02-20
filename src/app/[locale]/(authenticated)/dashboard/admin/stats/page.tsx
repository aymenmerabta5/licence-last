import { AdminStatsView } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView"
import { requireRole } from "@/lib/auth-guards"

export default async function AdminStatsPage() {
  await requireRole(["super_admin"])

  return (
    <div className="max-w-7xl mx-auto">
      <AdminStatsView />
    </div>
  )
}
