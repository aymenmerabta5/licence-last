import { Suspense } from "react"
import { AdminStatsView } from "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView"
import { requireRole } from "@/lib/auth-guards"

async function AdminStatsPageContent() {
  await requireRole(["super_admin"])

  return (
    <div className="max-w-7xl mx-auto">
      <AdminStatsView />
    </div>
  )
}

export default function AdminStatsPage() {
  return (
    <Suspense fallback={null}>
      <AdminStatsPageContent />
    </Suspense>
  )
}
