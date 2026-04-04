import { Suspense } from "react"
import { MessagesView } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView"
import { requireRole } from "@/lib/auth-guards"

async function MessagesPageContent() {
  const user = await requireRole(["student", "company_admin"])

  return (
    <div className="max-w-6xl mx-auto">
      <MessagesView
        role={user.role === "company_admin" ? "company_admin" : "student"}
        currentUserId={user.id}
      />
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesPageContent />
    </Suspense>
  )
}
