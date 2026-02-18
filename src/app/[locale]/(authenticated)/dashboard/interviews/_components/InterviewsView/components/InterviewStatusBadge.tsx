import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { InterviewStatus } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { getInterviewStatusLabel } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/utils"

interface InterviewStatusBadgeProps {
  status: InterviewStatus
}

const STATUS_STYLES: Record<InterviewStatus, string> = {
  pending_confirmation: "border-amber-300 text-amber-800 bg-amber-50",
  confirmed: "border-emerald-300 text-emerald-800 bg-emerald-50",
  cancelled: "border-rose-300 text-rose-800 bg-rose-50",
}

export function InterviewStatusBadge({ status }: InterviewStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] uppercase tracking-[0.08em]", STATUS_STYLES[status])}
    >
      {getInterviewStatusLabel(status)}
    </Badge>
  )
}
