import { requireRole } from "@/lib/auth-guards"
import { localeRedirect } from "@/lib/navigation"

export default async function InterviewDetailPage() {
  await requireRole(["student"])
  return localeRedirect("/dashboard/applications")
}
