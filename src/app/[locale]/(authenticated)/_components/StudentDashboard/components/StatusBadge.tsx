import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"

import { STATUS_STYLES, STATUS_TRANSLATION_KEYS } from "../utils"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const t = useTranslations("dashboard.student.status")
  const translationKey = STATUS_TRANSLATION_KEYS[status]

  return (
    <Badge
      className={cn(`border-none text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-none` , STATUS_STYLES[status] ?? "")}
    >
      {translationKey ? t(translationKey) : status}
    </Badge>
  )
}
