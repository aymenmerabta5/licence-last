import { Suspense } from "react"

import { SettingsView } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView"
import { Skeleton } from "@/components/ui/skeleton"
import { requireRole } from "@/lib/auth-guards"
import { getStudentProfile } from "@/server/services/students/get-profile"
import { getMe } from "@/server/services/users/get-me"

function SettingsFallback() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
      </div>
      <Skeleton className="h-96" />
    </div>
  )
}

async function SettingsPageContent() {
  const user = await requireRole([
    "student",
    "company_admin",
    "university_admin",
    "super_admin",
  ])

  const me = await getMe(user)
  const studentProfile =
    user.role === "student" ? await getStudentProfile(user.id) : null

  return <SettingsView me={me} studentProfile={studentProfile} />
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <SettingsPageContent />
    </Suspense>
  )
}
