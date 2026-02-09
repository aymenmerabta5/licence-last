import { requireRole } from "@/lib/auth-guards"
import { OfferForm } from "../_components/OfferForm"

export default async function CreateOfferPage() {
  await requireRole(["company_admin"])

  return (
    <div className="max-w-3xl mx-auto">
      <OfferForm mode="create" />
    </div>
  )
}
