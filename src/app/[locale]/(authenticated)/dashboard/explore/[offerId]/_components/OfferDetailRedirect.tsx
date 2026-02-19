import { localeRedirect } from "@/lib/navigation"

interface OfferDetailRedirectProps {
  offerId: string
}

/**
 * Server component that handles the redirect.
 * Separated to support Next.js 16 cacheComponents with Suspense boundary.
 */
export async function OfferDetailRedirect({
  offerId,
}: OfferDetailRedirectProps) {
  return localeRedirect(`/dashboard/student/offers/${offerId}`)
}
