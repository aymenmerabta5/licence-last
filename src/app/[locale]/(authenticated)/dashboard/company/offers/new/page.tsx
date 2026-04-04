import { Suspense } from "react"
import { OfferForm } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm"
import { requireApprovedCompanyAdmin } from "@/lib/dashboard-access"

async function CreateOfferPageContent() {
  await requireApprovedCompanyAdmin()

  return (
    <div className="max-w-3xl mx-auto">
      <OfferForm mode="create" />
    </div>
  )
}

export default function CreateOfferPage() {
  return (
    <Suspense fallback={null}>
      <CreateOfferPageContent />
    </Suspense>
  )
}
