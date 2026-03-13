import { OfferForm } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm"
import { requireApprovedCompanyAdmin } from "@/lib/dashboard-access"

export default async function CreateOfferPage() {
  await requireApprovedCompanyAdmin()

  return (
    <div className="max-w-3xl mx-auto">
      <OfferForm mode="create" />
    </div>
  )
}
