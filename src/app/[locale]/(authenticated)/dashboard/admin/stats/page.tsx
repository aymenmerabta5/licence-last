import { requireRole } from "@/lib/auth-guards"
import { AdminStatsClient } from "./_components/AdminStatsClient"

export default async function AdminStatsPage() {
  await requireRole(["admin", "super_admin"])

  return (
    <div className="max-w-6xl mx-auto">
      <AdminStatsClient />
    </div>
  )
}
