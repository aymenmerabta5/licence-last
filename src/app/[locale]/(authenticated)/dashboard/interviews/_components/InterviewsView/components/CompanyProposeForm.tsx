"use client"

import { CalendarPlus, Loader2, Send } from "lucide-react"
import * as motion from "motion/react-client"
import { CompanySlotsEditor } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/CompanySlotsEditor"
import type {
  CompanyApplicationOption,
  CompanyOfferOption,
  ProposedSlotDraft,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { formatPipelineStage } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

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
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease }}
      className="border border-border bg-card/30 dark:bg-card/50"
    >
      {/* Form header */}
      <div className="border-b border-border/50 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-primary/30 bg-primary/10">
            <CalendarPlus className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-lg text-heading">
              Schedule Interview
            </h2>
            <p className="text-xs font-light text-muted-foreground">
              Pick an application and propose time slots
            </p>
          </div>
        </div>
      </div>

      {/* Form body */}
      <form
        className="p-6 space-y-6"
        onSubmit={(event) => {
          event.preventDefault()
          void onSubmit()
        }}
      >
        {/* Step 1: Select offer & application */}
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            <span className="flex h-5 w-5 items-center justify-center border border-border text-[10px]">
              1
            </span>
            Select candidate
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="interview-offer"
                className="text-xs text-muted-foreground"
              >
                Offer
              </Label>
              <Select
                value={selectedOfferId}
                onValueChange={(value) => value && onOfferChange(value)}
                items={offers.map((o) => ({ value: o.id, label: o.title }))}
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
              {!isOffersLoading && offers.length === 0 && (
                <p className="text-[11px] text-muted-foreground/70">
                  No offers found for this company.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="interview-application"
                className="text-xs text-muted-foreground"
              >
                Application
              </Label>
              <Select
                value={applicationId}
                onValueChange={(value) =>
                  value && onApplicationIdChange(value)
                }
                disabled={!selectedOfferId}
                items={applications.map((a) => ({
                  value: a.id,
                  label: `${a.studentName} — ${formatPipelineStage(a.pipelineStage)}`,
                }))}
              >
                <SelectTrigger
                  id="interview-application"
                  className="w-full"
                >
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
                      {application.studentName} —{" "}
                      {formatPipelineStage(application.pipelineStage)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedOfferId &&
                !isApplicationsLoading &&
                applications.length === 0 && (
                  <p className="text-[11px] text-muted-foreground/70">
                    No eligible applications for this offer.
                  </p>
                )}
            </div>
          </div>
        </motion.div>

        <div className="h-px bg-border/50" />

        {/* Step 2: Time slots */}
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.15)}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            <span className="flex h-5 w-5 items-center justify-center border border-border text-[10px]">
              2
            </span>
            Propose time slots
          </div>

          <CompanySlotsEditor
            slots={slots}
            onSlotChange={onSlotChange}
            onAddSlot={onAddSlot}
            onRemoveSlot={onRemoveSlot}
          />
        </motion.div>

        <div className="h-px bg-border/50" />

        {/* Step 3: Note */}
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.2)}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            <span className="flex h-5 w-5 items-center justify-center border border-border text-[10px]">
              3
            </span>
            Add context
            <span className="font-normal normal-case tracking-normal">
              (optional)
            </span>
          </div>

          <Textarea
            id="interview-note"
            value={note}
            maxLength={1000}
            placeholder="Share context for the student — interview format, what to prepare, dress code..."
            className="min-h-[80px] resize-y"
            onChange={(event) => onNoteChange(event.target.value)}
          />
        </motion.div>

        {/* Submit */}
        <motion.div {...reveal} transition={revealWithDelay(0.25)}>
          <Button
            type="submit"
            variant="editorial"
            size="editorial"
            disabled={!canSubmit || isSubmitting}
            className="gap-2 w-full sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send proposal
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
}
