import { Suspense } from "react"

import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"

async function InterviewDetailPageContent() {
  await requireRole(["student"])
  return localeRedirect("/dashboard/applications")
}

export default function InterviewDetailPage() {
  return (
    <Suspense fallback={null}>
      <InterviewDetailPageContent />
    </Suspense>
  )
}
