import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"

export default async function InterviewDetailPage() {
  await requireRole(["student"])
  return localeRedirect("/dashboard/applications")
}
