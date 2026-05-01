import { Suspense } from "react"

import { SettingsView } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView"
import { SettingsPageSkeleton } from "@/app/[locale]/(authenticated)/dashboard/_components/DashboardPageSkeletons"

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsView />
    </Suspense>
  )
}
