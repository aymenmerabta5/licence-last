import { Plus, Trash2 } from "lucide-react"
import type { ProposedSlotDraft } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase tracking-[0.08em]">Slots</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={onAddSlot}
        >
          <Plus className="h-3.5 w-3.5" />
          Add slot
        </Button>
      </div>

      {slots.map((slot, index) => (
        <div key={slot.id} className="space-y-3 border border-border/50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Slot {index + 1}
            </p>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label={`Remove slot ${index + 1}`}
              disabled={slots.length === 1}
              onClick={() => onRemoveSlot(slot.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`slot-start-${slot.id}`} className="text-xs">
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
            <div className="space-y-1">
              <Label htmlFor={`slot-end-${slot.id}`} className="text-xs">
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
            <div className="space-y-1">
              <Label htmlFor={`slot-location-${slot.id}`} className="text-xs">
                Location (optional)
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
            <div className="space-y-1">
              <Label htmlFor={`slot-link-${slot.id}`} className="text-xs">
                Meeting URL (optional)
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

          {slot.startsAt && slot.endsAt ? (
            <p className="text-xs text-muted-foreground">
              Preview: {formatDateTime(slot.startsAt)} to{" "}
              {formatDateTime(slot.endsAt)}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
