import { requireRole } from "@/lib/auth-guards"
import { AdminStatsView } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView"

export default async function AdminStatsPage() {
  await requireRole(["super_admin"])

  return (
    <div className="max-w-6xl mx-auto">
      <AdminStatsView />
    </div>
  )
}
