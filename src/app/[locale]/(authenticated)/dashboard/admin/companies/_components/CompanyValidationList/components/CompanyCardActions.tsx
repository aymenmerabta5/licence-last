import { Check, X, PauseCircle, PlayCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

interface TranslationFn {
  (key: string): string
}

interface CompanyCardActionsProps {
  companyId: string
  status: string
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onSuspend: (id: string) => void
  onReactivate: (id: string) => void
  isApproving: boolean
  isRejecting: boolean
  isSuspending: boolean
  isReactivating: boolean
  t: TranslationFn
}

export function CompanyCardActions({
  companyId,
  status,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  isApproving,
  isRejecting,
  isSuspending,
  isReactivating,
  t,
}: CompanyCardActionsProps) {
  const canShowActions =
    status === "pending" || status === "approved" || status === "suspended"

  if (!canShowActions) return null

  return (
    <div className="flex flex-wrap gap-3 pt-2 border-t border-border/30">
      {status === "pending" ? (
        <>
          <Button
            type="button"
            variant="editorial"
            size="sm"
            className="h-9 px-5 rounded-lg"
            disabled={isApproving}
            onClick={() => onApprove(companyId)}
          >
            <Check className="h-3.5 w-3.5 me-1.5" />
            {t("approve")}
          </Button>
          <Button
            type="button"
            variant="editorial-outline"
            size="sm"
            className="h-9 px-5 rounded-lg"
            disabled={isRejecting}
            onClick={() => onReject(companyId)}
          >
            <X className="h-3.5 w-3.5 me-1.5" />
            {t("reject")}
          </Button>
        </>
      ) : null}

      {status === "approved" ? (
        <Button
          type="button"
          variant="editorial-outline"
          size="sm"
          className="h-9 px-5 rounded-lg"
          disabled={isSuspending}
          onClick={() => onSuspend(companyId)}
        >
          <PauseCircle className="h-3.5 w-3.5 me-1.5" />
          {t("suspend")}
        </Button>
      ) : null}

      {status === "suspended" ? (
        <Button
          type="button"
          variant="editorial"
          size="sm"
          className="h-9 px-5 rounded-lg"
          disabled={isReactivating}
          onClick={() => onReactivate(companyId)}
        >
          <PlayCircle className="h-3.5 w-3.5 me-1.5" />
          {t("reactivate")}
        </Button>
      ) : null}
    </div>
  )
}
