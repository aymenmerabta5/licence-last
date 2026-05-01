import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"

type Params = Promise<{ interviewId: string }>

export default async function InterviewDetailPage({ params }: { params: Params }) {
  await params
  await requireRole(["student"])
  return localeRedirect("/dashboard/applications")
}
