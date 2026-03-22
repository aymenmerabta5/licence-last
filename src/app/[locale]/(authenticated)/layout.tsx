import { Suspense } from "react"

import { AuthenticatedContent } from "@/app/[locale]/(authenticated)/_components/AuthenticatedContent"
import { DashboardShellSkeleton } from "@/app/[locale]/(authenticated)/_components/DashboardShellSkeleton"

/**
 * Authenticated layout with cacheComponents support.
 * Uses Suspense boundary to handle dynamic auth checks.
 */
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <AuthenticatedContent>{children}</AuthenticatedContent>
    </Suspense>
  )
}
