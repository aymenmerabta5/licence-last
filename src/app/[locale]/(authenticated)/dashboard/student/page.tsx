import { Suspense } from "react"
import { localeRedirect } from "@/lib/navigation"

export async function StudentDashboardPageContent() {
  return localeRedirect("/dashboard")
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={null}>
      <StudentDashboardPageContent />
    </Suspense>
  )
}
