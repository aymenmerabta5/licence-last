import { CalendarPlus, Loader2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatDateTime } from "@/lib/date"

import type {
  CompanyApplicationOption,
  CompanyOfferOption,
  ProposedSlotDraft,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { formatPipelineStage } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/utils"

type SlotField = Exclude<keyof ProposedSlotDraft, "id">

interface CompanyProposeFormProps {
  offers: CompanyOfferOption[]
  applications: CompanyApplicationOption[]
  selectedOfferId: string
  applicationId: string
  note: string
  slots: ProposedSlotDraft[]
  canSubmit: boolean
  isSubmitting: boolean
  isOffersLoading: boolean
  isApplicationsLoading: boolean
  onOfferChange: (value: string) => void
  onApplicationIdChange: (value: string) => void
  onNoteChange: (value: string) => void
  onSlotChange: (slotId: string, field: SlotField, value: string) => void
  onAddSlot: () => void
  onRemoveSlot: (slotId: string) => void
  onSubmit: () => Promise<void>
}

export function CompanyProposeForm({
  offers,
  applications,
  selectedOfferId,
  applicationId,
  note,
  slots,
  canSubmit,
  isSubmitting,
  isOffersLoading,
  isApplicationsLoading,
  onOfferChange,
  onApplicationIdChange,
  onNoteChange,
  onSlotChange,
  onAddSlot,
  onRemoveSlot,
  onSubmit,
}: CompanyProposeFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <CalendarPlus className="h-4 w-4" />
          Propose interview slots
        </CardTitle>
        <CardDescription>
          Pick an application and share one or more slot options.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            void onSubmit()
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="interview-offer" className="text-xs uppercase tracking-[0.08em]">
              Offer
            </Label>
            <Select value={selectedOfferId} onValueChange={(value) => value && onOfferChange(value)}>
              <SelectTrigger id="interview-offer" className="w-full">
                <SelectValue placeholder={isOffersLoading ? "Loading offers..." : "Select an offer"} />
              </SelectTrigger>
              <SelectContent>
                {offers.map((offer) => (
                  <SelectItem key={offer.id} value={offer.id}>
                    {offer.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isOffersLoading && offers.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No offers found for this company.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview-application" className="text-xs uppercase tracking-[0.08em]">
              Application
            </Label>
            <Select
              value={applicationId}
              onValueChange={(value) => value && onApplicationIdChange(value)}
              disabled={!selectedOfferId}
            >
              <SelectTrigger id="interview-application" className="w-full">
                <SelectValue
                  placeholder={
                    selectedOfferId
                      ? isApplicationsLoading
                        ? "Loading applications..."
                        : "Select an application"
                      : "Select an offer first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {applications.map((application) => (
                  <SelectItem key={application.id} value={application.id}>
                    {application.studentName} - {formatPipelineStage(application.pipelineStage)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedOfferId && !isApplicationsLoading && applications.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No applications available for this offer.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview-application-id" className="text-xs uppercase tracking-[0.08em]">
              Application ID (manual)
            </Label>
            <Input
              id="interview-application-id"
              value={applicationId}
              placeholder="app_..."
              onChange={(event) => onApplicationIdChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview-note" className="text-xs uppercase tracking-[0.08em]">
              Note (optional)
            </Label>
            <Textarea
              id="interview-note"
              value={note}
              maxLength={1000}
              placeholder="Share context for the student..."
              onChange={(event) => onNoteChange(event.target.value)}
            />
          </div>

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
              <div key={slot.id} className="border border-border/50 p-3 space-y-3">
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

                {slot.startsAt && slot.endsAt && (
                  <p className="text-xs text-muted-foreground">
                    Preview: {formatDateTime(slot.startsAt)} to {formatDateTime(slot.endsAt)}
                  </p>
                )}
              </div>
            ))}
          </div>

          <Button
            type="submit"
            variant="editorial"
            size="editorial"
            disabled={!canSubmit || isSubmitting}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Send proposal
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
