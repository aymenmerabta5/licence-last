import { DocumentsView } from "@/app/[locale]/(authenticated)/dashboard/student/documents/_components/DocumentsView"
import { requireRole } from "@/lib/auth-guards"
import { localeRedirect } from "@/lib/navigation"

export default async function StudentDocumentsPage() {
  const user = await requireRole(["student"])

  if (!user.onboardingCompleted) {
    return localeRedirect("/onboarding/student")
  }

  return <DocumentsView />
}
