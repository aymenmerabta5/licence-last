import { Suspense } from "react"

import { MessagesView } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView"
import { Skeleton } from "@/components/ui/skeleton"
import { requireRole } from "@/lib/auth-guards"

export default async function MessagesPage() {
  const user = await requireRole(["student", "company_admin"])

  return (
    <div className="max-w-6xl mx-auto">
      <Suspense fallback={<MessagesSkeleton />}>
        <MessagesView
          role={user.role === "company_admin" ? "company_admin" : "student"}
          currentUserId={user.id}
        />
      </Suspense>
    </div>
  )
}

function MessagesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}
