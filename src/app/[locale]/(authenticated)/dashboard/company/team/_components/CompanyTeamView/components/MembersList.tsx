"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/date"
import { cn } from "@/lib/utils"

export interface MemberItem {
  userId: string
  email: string
  name: string | null
  role: "owner" | "recruiter"
  joinedAt: Date | string
}

interface MembersListProps {
  members: MemberItem[]
  currentUserId: string
  canManageMembers: boolean
  isRemoving: boolean
  onRemove: (member: MemberItem) => void
}

function formatJoinedAt(value: Date | string, unknownDateLabel: string) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return unknownDateLabel
  }
  return formatDate(date)
}

export function MembersList({
  members,
  currentUserId,
  canManageMembers,
  isRemoving,
  onRemove,
}: MembersListProps) {
  const t = useTranslations("dashboard.company.team")

  if (members.length === 0) {
    return (
      <div className="border border-dashed border-border p-8 text-sm text-muted-foreground text-center">
        {t("empty")}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const isCurrentUser = member.userId === currentUserId
        const canRemove =
          canManageMembers && member.role !== "owner" && !isCurrentUser

        return (
          <div
            key={member.userId}
            className="border border-border/60 bg-card/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-sm text-heading truncate">
                  {member.name ?? t("unnamedMember")}
                </p>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 border",
                    member.role === "owner"
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {t(`roles.${member.role}`)}
                </span>
                {isCurrentUser && (
                  <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                    {t("you")}
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground">{member.email}</p>
              <p className="text-[11px] text-muted-foreground/80">
                {t("joined", {
                  date: formatJoinedAt(member.joinedAt, t("unknownDate")),
                })}
              </p>
            </div>

            {canRemove && (
              <Button
                type="button"
                size="sm"
                variant="editorial-outline"
                disabled={isRemoving}
                onClick={() => onRemove(member)}
              >
                {t("remove")}
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
