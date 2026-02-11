import { Suspense } from "react"

import { requireRole } from "@/lib/auth-guards"
import { DashboardClientProvider } from "@/app/[locale]/(authenticated)/_components/DashboardClientProvider"
import { AuthenticatedContent } from "./_components/AuthenticatedContent"

/**
 * Authenticated layout with cacheComponents support.
 * Uses Suspense boundary to handle dynamic auth checks.
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AuthenticatedContent>{children}</AuthenticatedContent>
    </Suspense>
  )
}
