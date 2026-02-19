"use client"

import { Check, Loader2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import type { DeviceSession } from "@/app/[locale]/(authenticated)/_components/DashboardNavbar/types"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface AccountRowProps {
  session: DeviceSession
  isActive: boolean
  isSwitching: boolean
  isRemoving: boolean
  onSwitch: (token: string, name: string) => void
  onRemove: (token: string) => void
}

export function AccountRow({
  session,
  isActive,
  isSwitching,
  isRemoving,
  onSwitch,
  onRemove,
}: AccountRowProps) {
  const t = useTranslations("dashboard.accountSwitcher")
  const { user, session: sess } = session
  const displayName = user.name || user.email
  const initial = displayName.charAt(0).toUpperCase()

  if (isActive) {
    return (
      <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-primary/5">
        <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-heading truncate">
            {displayName}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {user.role || "student"}
          </p>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-primary uppercase tracking-wider shrink-0">
          <Check className="h-3 w-3" />
          {t("activeLabel")}
        </span>
      </div>
    )
  }

  return (
    <DropdownMenuItem
      className="flex items-center gap-3 rounded-lg h-auto py-2 cursor-pointer focus:bg-secondary/80 transition-colors group"
      disabled={isSwitching || isRemoving}
      onClick={() => onSwitch(sess.token, displayName)}
    >
      <div className="h-8 w-8 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground font-bold text-xs shrink-0">
        {isSwitching ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          initial
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-heading truncate">
          {displayName}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">
          {user.role || "student"}
        </p>
      </div>
      <button
        className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
        aria-label={t("removeAccount")}
        onClick={(e) => {
          e.stopPropagation()
          onRemove(sess.token)
        }}
      >
        {isRemoving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
      </button>
    </DropdownMenuItem>
  )
}
