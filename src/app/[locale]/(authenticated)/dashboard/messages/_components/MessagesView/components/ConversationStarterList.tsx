"use client"

import { ArrowUpRight, MessageCirclePlus } from "lucide-react"
import { useTranslations } from "next-intl"
import type {
  MessageConversationStarter,
  MessagesRole,
} from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ConversationStarterListProps {
  role: MessagesRole
  starters: MessageConversationStarter[]
  selectedStarterId: string | null
  onSelectStarter: (starterId: string) => void
}

function getInitials(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return "?"
  }

  const parts = trimmed.split(/\s+/).slice(0, 2)
  return parts.map((part) => part.charAt(0).toUpperCase()).join("")
}

function getStarterDisplayName(
  starter: MessageConversationStarter,
  role: MessagesRole,
  fallbackCompanyName: string,
  fallbackStudentName: string,
): string {
  if (role === "student") {
    return starter.companyName?.trim() || fallbackCompanyName
  }

  return starter.studentName?.trim() || fallbackStudentName
}

function getStarterImage(
  starter: MessageConversationStarter,
  role: MessagesRole,
): string | undefined {
  if (role === "student") {
    return starter.companyLogoUrl ?? undefined
  }

  return starter.studentImage ?? undefined
}

export function ConversationStarterList({
  role,
  starters,
  selectedStarterId,
  onSelectStarter,
}: ConversationStarterListProps) {
  const t = useTranslations("dashboard.messages")

  if (starters.length === 0) {
    return null
  }

  const fallbackCompanyName = t("fallbackCompanyName")
  const fallbackStudentName = t("fallbackStudentName")

  return (
    <section className="mt-4 border-t border-border/30 pt-4">
      <div className="pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary [[dir=rtl]_&]:tracking-normal">
          {t("startersLabel")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {role === "student"
            ? t("startersDescriptionStudent")
            : t("startersDescriptionCompany")}
        </p>
      </div>

      <div className="space-y-1">
        {starters.map((starter) => {
          const displayName = getStarterDisplayName(
            starter,
            role,
            fallbackCompanyName,
            fallbackStudentName,
          )
          const isActive = starter.id === selectedStarterId

          return (
            <button
              key={starter.id}
              type="button"
              className={cn(
                "w-full border px-3 py-3 text-start transition-colors",
                "hover:border-primary/30 hover:bg-primary/5",
                isActive
                  ? "border-primary/40 bg-primary/10"
                  : "border-border/40 bg-background/40",
              )}
              onClick={() => onSelectStarter(starter.id)}
            >
              <div className="flex items-start gap-3">
                <Avatar size="sm">
                  <AvatarImage src={getStarterImage(starter, role)} alt="" />
                  <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {displayName}
                    </p>
                    <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  </div>

                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {starter.offerTitle}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground/80">
                    <MessageCirclePlus className="h-3 w-3" />
                    <span>{t("startConversationAction")}</span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
