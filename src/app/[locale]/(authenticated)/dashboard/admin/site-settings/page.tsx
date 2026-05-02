import { Suspense } from "react"
import { SiteSettingsView } from "@/app/[locale]/(authenticated)/dashboard/admin/site-settings/_components/SiteSettingsView"
import { requireRole } from "@/lib/auth-guards"

async function SiteSettingsContent() {
  await requireRole(["super_admin"])
  return <SiteSettingsView />
}

export default function SiteSettingsPage() {
  return (
    <Suspense fallback={null}>
      <SiteSettingsContent />
    </Suspense>
  )
}
