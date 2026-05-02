import { SettingsView } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView"
import { requireRole } from "@/lib/auth-guards"
import { getMe } from "@/server/services/users/get-me"
import { getStudentProfile } from "@/server/services/students/get-profile"

export default async function SettingsPage() {
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
