import { Suspense } from "react"
import { CompanyDocumentsPageContent } from "@/app/[locale]/(authenticated)/dashboard/company/documents/_components/CompanyDocumentsPageContent"
import { Skeleton } from "@/components/ui/skeleton"

function CompanyDocumentsFallback() {
  return (
    <div
      className="mx-auto max-w-5xl space-y-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-2">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}

export default function CompanyDocumentsPage() {
  return (
    <Suspense fallback={<CompanyDocumentsFallback />}>
      <CompanyDocumentsPageContent />
    </Suspense>
  )
}
