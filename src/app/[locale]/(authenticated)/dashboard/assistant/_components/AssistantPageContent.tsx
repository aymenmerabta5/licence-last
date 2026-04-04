import { notFound } from "next/navigation"
import { AssistantChat } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat"
import { requireApprovedCompanyAdmin } from "@/lib/dashboard-access"
import { isFeatureEnabled } from "@/lib/feature-flags"

/**
 * Server component wrapper for request-bound auth checks.
 * Keeping this async work under the page Suspense boundary avoids
 * cacheComponents cleanup warnings in React/Next.js.
 */
export async function AssistantPageContent() {
  if (!isFeatureEnabled("COMPANY_ASSISTANT")) {
    notFound()
  }

  await requireApprovedCompanyAdmin()

  return <AssistantChat />
}
