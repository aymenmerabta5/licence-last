import { OfferForm } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm"
import { requireRole } from "@/lib/auth-guards"

export default async function CreateOfferPage() {
  await requireRole(["company_admin"])

  return (
    <div className="max-w-3xl mx-auto">
      <OfferForm mode="create" />
    </div>
  )
}
