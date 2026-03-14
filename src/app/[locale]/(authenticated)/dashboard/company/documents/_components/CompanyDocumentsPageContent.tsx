import { CompanyDocumentsView } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsView"
import { requireApprovedCompanyAdmin } from "@/lib/dashboard-access"

/**
 * Server component wrapper for request-bound auth checks.
 * Keeping this async work under the page Suspense boundary avoids
 * cacheComponents cleanup warnings in React/Next.js.
 */
export async function CompanyDocumentsPageContent() {
  await requireApprovedCompanyAdmin()

  return <CompanyDocumentsView />
}
