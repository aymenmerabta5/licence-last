"use client"

import { Building2, ChevronDown, ChevronUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { STATUS_COLORS } from "@/lib/constants/pipeline"
import { cn } from "@/lib/utils"
import type { ApplicationJourney } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/types"

interface ApplicationJourneyCardHeaderProps {
  journey: ApplicationJourney
  isExpanded: boolean
  nextActionClass: string
  nextActionLabel: string
  onToggleExpand: () => void
  tStatus: (key: string) => string
}

export function ApplicationJourneyCardHeader({
  journey,
  isExpanded,
  nextActionClass,
  nextActionLabel,
  onToggleExpand,
  tStatus,
}: ApplicationJourneyCardHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggleExpand}
      className="flex w-full items-center gap-4 p-4 text-start transition-colors hover:bg-muted/20"
    >
      <Avatar size="lg">
        {journey.companyLogoUrl && (
          <AvatarImage
            src={journey.companyLogoUrl}
            alt={journey.companyName}
          />
        )}
        <AvatarFallback>
          <Building2 className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-serif text-base text-heading">
          {journey.offerTitle}
        </h3>
        <p className="truncate text-xs font-light text-muted-foreground">
          {journey.companyName}
        </p>
      </div>

      <div className="hidden shrink-0 items-center gap-3 sm:flex">
        <span
          className={cn(
            "inline-flex items-center border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            STATUS_COLORS[journey.status] ?? "",
          )}
        >
          {tStatus(journey.status)}
        </span>

        <span
          className={cn(
            "inline-flex items-center border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            nextActionClass,
          )}
        >
          {nextActionLabel}
        </span>

        <span className="text-xs text-muted-foreground">
          {new Date(journey.createdAt).toLocaleDateString()}
        </span>

        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </button>
  )
}
