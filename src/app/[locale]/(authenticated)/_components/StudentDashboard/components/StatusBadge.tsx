import { Badge } from "@/components/ui/badge"

import { STATUS_STYLES, STATUS_LABELS } from "../utils"

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      className={`border-none text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-none ${STATUS_STYLES[status] ?? ""}`}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
