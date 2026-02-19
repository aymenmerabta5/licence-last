import { CalendarPlus, Loader2 } from "lucide-react"
import { CompanySlotsEditor } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/CompanySlotsEditor"
import type {
  CompanyApplicationOption,
  CompanyOfferOption,
  ProposedSlotDraft,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { formatPipelineStage } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

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
            <Label
              htmlFor="interview-offer"
              className="text-xs uppercase tracking-[0.08em]"
            >
              Offer
            </Label>
            <Select
              value={selectedOfferId}
              onValueChange={(value) => value && onOfferChange(value)}
            >
              <SelectTrigger id="interview-offer" className="w-full">
                <SelectValue
                  placeholder={
                    isOffersLoading ? "Loading offers..." : "Select an offer"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {offers.map((offer) => (
                  <SelectItem key={offer.id} value={offer.id}>
                    {offer.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isOffersLoading && offers.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No offers found for this company.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="interview-application"
              className="text-xs uppercase tracking-[0.08em]"
            >
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
                    {application.studentName} -{" "}
                    {formatPipelineStage(application.pipelineStage)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedOfferId &&
            !isApplicationsLoading &&
            applications.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No applications available for this offer.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="interview-note"
              className="text-xs uppercase tracking-[0.08em]"
            >
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

          <CompanySlotsEditor
            slots={slots}
            onSlotChange={onSlotChange}
            onAddSlot={onAddSlot}
            onRemoveSlot={onRemoveSlot}
          />

          <Button
            type="submit"
            variant="editorial"
            size="editorial"
            disabled={!canSubmit || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send proposal
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
