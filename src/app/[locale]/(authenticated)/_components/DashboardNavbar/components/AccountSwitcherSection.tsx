"use client"

import { UserPlus } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { AccountRow } from "./AccountRow"
import type { DeviceSession } from "../types"

interface AccountSwitcherSectionProps {
  sessions: DeviceSession[]
  isLoading: boolean
  currentUserId: string
  switchingToken: string | null
  removingToken: string | null
  onSwitch: (token: string, name: string) => void
  onRemove: (token: string) => void
  onAdd: () => void
}

export function AccountSwitcherSection({
  sessions,
  isLoading,
  currentUserId,
  switchingToken,
  removingToken,
  onSwitch,
  onRemove,
  onAdd,
}: AccountSwitcherSectionProps) {
  const t = useTranslations("dashboard.accountSwitcher")

  return (
    <>
      <DropdownMenuSeparator className="my-1.5 opacity-50" />
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
          {t("title")}
        </DropdownMenuLabel>

        {isLoading ? (
          <div className="space-y-2 px-2 py-1">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2.5 w-14" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {sessions.map((session) => (
              <AccountRow
                key={session.session.id}
                session={session}
                isActive={session.user.id === currentUserId}
                isSwitching={switchingToken === session.session.token}
                isRemoving={removingToken === session.session.token}
                onSwitch={onSwitch}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}

        <DropdownMenuItem
          className="rounded-lg h-9 cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors mt-1"
          onClick={onAdd}
        >
          <UserPlus className="h-4 w-4 me-2" />
          {t("addAccount")}
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  )
}
