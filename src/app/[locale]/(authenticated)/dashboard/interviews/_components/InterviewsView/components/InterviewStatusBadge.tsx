import { useTranslations } from "next-intl"
import type { InterviewStatus } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { getInterviewStatusLabel } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/utils"
import { cn } from "@/lib/utils"

interface InterviewStatusBadgeProps {
  status: InterviewStatus
}

const STATUS_STYLES: Record<InterviewStatus, string> = {
  pending_confirmation:
    "border-amber-400/60 text-amber-700 bg-amber-50 dark:border-amber-500/40 dark:text-amber-300 dark:bg-amber-950/40",
  confirmed:
    "border-emerald-400/60 text-emerald-700 bg-emerald-50 dark:border-emerald-500/40 dark:text-emerald-300 dark:bg-emerald-950/40",
  cancelled:
    "border-rose-400/60 text-rose-700 bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:bg-rose-950/40",
}

const STATUS_DOT: Record<InterviewStatus, string> = {
  pending_confirmation: "bg-amber-500 dark:bg-amber-400",
  confirmed: "bg-emerald-500 dark:bg-emerald-400",
  cancelled: "bg-rose-500 dark:bg-rose-400",
}

export function InterviewStatusBadge({ status }: InterviewStatusBadgeProps) {
  const t = useTranslations("dashboard.interviews")

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]",
        STATUS_STYLES[status],
      )}
    >
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          STATUS_DOT[status],
        )}
      />
      {getInterviewStatusLabel(status, t)}
    </span>
  )
}
