import { InterviewsView } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView"
import type { InterviewsRole } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { requireRole } from "@/lib/auth-guards"

export default async function InterviewsPage() {
  const user = await requireRole(["student", "company_admin"])

  const role: InterviewsRole =
    user.role === "company_admin" ? "company_admin" : "student"

  return <InterviewsView role={role} />
}
