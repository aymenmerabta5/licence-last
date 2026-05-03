"use client"

import { GraduationCap } from "lucide-react"
import { useDragLayer } from "react-dnd"

import {
  CANDIDATE_CARD_DND_TYPE,
  type CandidateCardDragItem,
} from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/types"
import { STATUS_COLORS } from "@/lib/constants/pipeline"
import { cn } from "@/lib/utils"

export function CandidateDragLayer() {
  const {
    isDragging,
    item,
    itemType,
    currentOffset,
    initialClientOffset,
    initialSourceClientOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
    initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
  }))

  if (
    !isDragging ||
    itemType !== CANDIDATE_CARD_DND_TYPE ||
    !currentOffset ||
    !item ||
    !initialClientOffset ||
    !initialSourceClientOffset
  ) {
    return null
  }

  const { app } = item as CandidateCardDragItem

  // Maintain the same relative grab point so the card doesn't jump
  const grabOffsetX = initialClientOffset.x - initialSourceClientOffset.x
  const grabOffsetY = initialClientOffset.y - initialSourceClientOffset.y

  const x = currentOffset.x - grabOffsetX
  const y = currentOffset.y - grabOffsetY

  const initials = (app.student.name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    >
      <div
        className={cn(
          "w-64 border border-border/50 bg-background p-3.5 space-y-2 shadow-xl rounded-sm",
          "opacity-90 scale-[1.02] rotate-1",
        )}
        style={{
          transform: `translate(${x}px, ${y}px)`,
        }}
      >
        {/* Student info row */}
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary">
              {initials}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-heading truncate">
              {app.student.name || "Anonymous"}
            </p>
            {app.university && (
              <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                <GraduationCap className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {app.university.abbreviation || app.university.name}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase border rounded-sm ${STATUS_COLORS[app.status] ?? ""}`}
        >
          {app.status.replace("_", " ")}
        </span>

        {/* Skills summary */}
        {app.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {app.skills.slice(0, 3).map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center rounded-full bg-primary/5 px-2 py-0.5 text-[9px] font-medium text-primary/80"
              >
                {skill.name}
              </span>
            ))}
            {app.skills.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-muted/50 px-2 py-0.5 text-[9px] font-medium text-muted-foreground/60">
                +{app.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
