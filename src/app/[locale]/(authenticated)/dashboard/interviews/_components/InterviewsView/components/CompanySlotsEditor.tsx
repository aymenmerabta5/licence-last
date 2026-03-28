"use client"

import { Clock, Link2, MapPin, Plus, Trash2 } from "lucide-react"
import * as motion from "motion/react-client"
import type { ProposedSlotDraft } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { reveal, revealWithDelay } from "@/lib/animations"
import { formatDateTime } from "@/lib/date"

type SlotField = Exclude<keyof ProposedSlotDraft, "id">

interface CompanySlotsEditorProps {
  slots: ProposedSlotDraft[]
  onSlotChange: (slotId: string, field: SlotField, value: string) => void
  onAddSlot: () => void
  onRemoveSlot: (slotId: string) => void
}

export function CompanySlotsEditor({
  slots,
  onSlotChange,
  onAddSlot,
  onRemoveSlot,
}: CompanySlotsEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <Label className="text-xs font-bold uppercase tracking-[0.1em]">
            Time Slots
          </Label>
          <span className="text-xs text-muted-foreground">
            ({slots.length})
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="editorial-ghost"
          className="gap-1.5 text-xs"
          onClick={onAddSlot}
        >
          <Plus className="h-3.5 w-3.5" />
          Add slot
        </Button>
      </div>

      <div className="relative space-y-3">
        {/* Timeline line */}
        {slots.length > 1 && (
          <div className="absolute start-3 top-4 bottom-4 w-px bg-border" />
        )}

        {slots.map((slot, index) => (
          <motion.div
            key={slot.id}
            {...reveal}
            transition={revealWithDelay(index * 0.05)}
            className="relative"
          >
            {/* Timeline dot */}
            {slots.length > 1 && (
              <div className="absolute start-1.5 top-4 h-3 w-3 rounded-full border-2 border-primary bg-background z-10" />
            )}

            <div
              className={
                slots.length > 1
                  ? "ms-8 border border-border/60 bg-card/50 p-4 space-y-3"
                  : "border border-border/60 bg-card/50 p-4 space-y-3"
              }
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Slot {index + 1}
                </span>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Remove slot ${index + 1}`}
                  disabled={slots.length === 1}
                  onClick={() => onRemoveSlot(slot.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor={`slot-start-${slot.id}`}
                    className="text-[11px] text-muted-foreground"
                  >
                    Starts at
                  </Label>
                  <Input
                    id={`slot-start-${slot.id}`}
                    type="datetime-local"
                    value={slot.startsAt}
                    onChange={(event) =>
                      onSlotChange(slot.id, "startsAt", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor={`slot-end-${slot.id}`}
                    className="text-[11px] text-muted-foreground"
                  >
                    Ends at
                  </Label>
                  <Input
                    id={`slot-end-${slot.id}`}
                    type="datetime-local"
                    value={slot.endsAt}
                    onChange={(event) =>
                      onSlotChange(slot.id, "endsAt", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor={`slot-location-${slot.id}`}
                    className="text-[11px] text-muted-foreground inline-flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    Location
                  </Label>
                  <Input
                    id={`slot-location-${slot.id}`}
                    value={slot.location}
                    placeholder="Office room, campus, etc."
                    onChange={(event) =>
                      onSlotChange(slot.id, "location", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor={`slot-link-${slot.id}`}
                    className="text-[11px] text-muted-foreground inline-flex items-center gap-1"
                  >
                    <Link2 className="h-3 w-3" />
                    Meeting URL
                  </Label>
                  <Input
                    id={`slot-link-${slot.id}`}
                    type="url"
                    value={slot.meetingUrl}
                    placeholder="https://..."
                    onChange={(event) =>
                      onSlotChange(slot.id, "meetingUrl", event.target.value)
                    }
                  />
                </div>
              </div>

              {slot.startsAt && slot.endsAt && (
                <p className="text-[11px] text-muted-foreground/70 border-t border-border/30 pt-2">
                  {formatDateTime(slot.startsAt)} — {formatDateTime(slot.endsAt)}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
