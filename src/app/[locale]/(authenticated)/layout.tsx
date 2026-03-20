import { Suspense } from "react"

import { AuthenticatedContent } from "@/app/[locale]/(authenticated)/_components/AuthenticatedContent"

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
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AuthenticatedContent>{children}</AuthenticatedContent>
    </Suspense>
  )
}
