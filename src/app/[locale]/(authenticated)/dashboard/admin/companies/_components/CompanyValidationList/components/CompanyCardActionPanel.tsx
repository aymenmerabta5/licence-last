import { Check, PauseCircle, PlayCircle, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"

interface TranslationFn {
  (key: string): string
}

interface CompanyCardActionPanelProps {
  companyId: string
  companyStatus: string
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onSuspend: (id: string) => void
  onReactivate: (id: string) => void
  onDelete: () => void
  isApproving: boolean
  isRejecting: boolean
  isSuspending: boolean
  isReactivating: boolean
  isDeleting: boolean
  t: TranslationFn
}

export function CompanyCardActionPanel({
  companyId,
  companyStatus,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  onDelete,
  isApproving,
  isRejecting,
  isSuspending,
  isReactivating,
  isDeleting,
  t,
}: CompanyCardActionPanelProps) {
  return (
    <div className="shrink-0 flex flex-col items-stretch gap-2 min-w-[140px]">
      {companyStatus === "pending" && (
        <>
          <Button
            type="button"
            variant="editorial"
            size="sm"
            className="w-full justify-start h-9 rounded-sm font-medium"
            disabled={isApproving}
            onClick={() => onApprove(companyId)}
          >
            <Check className="h-3.5 w-3.5 me-2" />
            {t("approve")}
          </Button>
          <Button
            type="button"
            variant="editorial-outline"
            size="sm"
            className="w-full justify-start h-9 rounded-sm font-medium border-border/60 hover:border-black dark:hover:border-white"
            disabled={isRejecting}
            onClick={() => onReject(companyId)}
          >
            <X className="h-3.5 w-3.5 me-2 text-red-500" />
            {t("reject")}
          </Button>
        </>
      )}

      {companyStatus === "approved" && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start h-8 text-xs text-orange-600/70 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-sm"
          disabled={isSuspending}
          onClick={() => onSuspend(companyId)}
        >
          <PauseCircle className="h-3.5 w-3.5 me-2" />
          {t("suspend")}
        </Button>
      )}

      {companyStatus === "suspended" && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start h-8 text-xs text-emerald-600/70 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-sm"
          disabled={isReactivating}
          onClick={() => onReactivate(companyId)}
        >
          <PlayCircle className="h-3.5 w-3.5 me-2" />
          {t("reactivate")}
        </Button>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-start h-8 text-xs text-red-600/70 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-sm"
        disabled={isDeleting}
        onClick={onDelete}
      >
        <Trash2 className="h-3.5 w-3.5 me-2" />
        {t("delete")}
      </Button>
    </div>
  )
}
