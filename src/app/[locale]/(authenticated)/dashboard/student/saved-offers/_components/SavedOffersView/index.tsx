"use client"

import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { SavedOffersList } from "@/app/[locale]/(authenticated)/dashboard/student/saved-offers/_components/SavedOffersView/components/SavedOffersList"
import { useSavedOffers } from "@/app/[locale]/(authenticated)/dashboard/student/saved-offers/_components/SavedOffersView/hooks/useSavedOffers"
import { Button } from "@/components/ui/button"
import { resolveLocalizedError } from "@/lib/error-message"

export function SavedOffersView() {
  const t = useTranslations()
  const {
    offers,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    unsaveMutation,
  } = useSavedOffers()

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">
          Student Workspace
        </p>
        <h1 className="font-serif text-3xl text-heading tracking-tight">
          Saved Offers
        </h1>
        <p className="text-sm text-muted-foreground">
          Keep track of opportunities you want to revisit.
        </p>
      </header>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading saved offers...</p>
      )}

      {isError && (
        <div className="border border-destructive/20 text-destructive p-4 text-sm">
          {resolveLocalizedError(error, {
            t,
            fallbackKey: "errors.common.savedOffersLoadFailed",
          })}
        </div>
      )}

      {!isLoading && !isError && (
        <SavedOffersList
          offers={offers}
          unsaving={unsaveMutation.isPending}
          onUnsave={async (offerId) => {
            try {
              await unsaveMutation.mutateAsync({ offerId })
              toast.success(t("errors.common.savedOfferRemoved"))
            } catch (err) {
              toast.error(
                resolveLocalizedError(err, {
                  t,
                  fallbackKey: "errors.common.savedOfferRemoveFailed",
                }),
              )
            }
          }}
        />
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="editorial-outline"
            size="sm"
            disabled={isFetchingNextPage}
            onClick={() => {
              void fetchNextPage()
            }}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  )
}
