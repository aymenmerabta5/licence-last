import { AssistantChat } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat"
import { requireApprovedCompanyAdmin } from "@/lib/dashboard-access"

/**
 * Server component wrapper for request-bound auth checks.
 * Keeping this async work under the page Suspense boundary avoids
 * cacheComponents cleanup warnings in React/Next.js.
 */
export async function AssistantPageContent() {
  await requireApprovedCompanyAdmin()

  return <AssistantChat />
}
