"use client"

import { useTranslations } from "next-intl"
import { useCallback, useEffect, useState } from "react"
import { InterviewProposalModalFooter } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/InterviewProposalModalFooter"
import { InterviewProposalModalHeader } from "@/app/[locale]/(authenticated)/dashboard/company/offers/[offerId]/candidates/_components/CandidatesView/components/InterviewProposalModalHeader"
import * as motion from "motion/react-client"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ease, reveal } from "@/lib/animations"
import { CompanySlotsEditor } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/CompanySlotsEditor"
import type { ProposedSlotDraft } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { normalizeLocalDateTimeInput } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData.helpers"

interface InterviewProposalModalProps {
  applicationId: string
  studentName: string
  offerTitle: string
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (payload: {
    applicationId: string
    note?: string
    slots: Array<{
      startsAt: string
      endsAt: string
      location?: string
      meetingUrl?: string
    }>
  }) => Promise<void>
}

export function InterviewProposalModal({
  applicationId,
  studentName,
  offerTitle,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: InterviewProposalModalProps) {
  const t = useTranslations("dashboard.company.candidates")
  const [slots, setSlots] = useState<ProposedSlotDraft[]>([
    {
      id: crypto.randomUUID(),
      startsAt: "",
      endsAt: "",
      location: "",
      meetingUrl: "",
    },
  ])
  const [note, setNote] = useState("")

  useEffect(() => {
    if (isOpen) {
      setSlots([
        {
          id: crypto.randomUUID(),
          startsAt: "",
          endsAt: "",
          location: "",
          meetingUrl: "",
        },
      ])
      setNote("")
    }
  }, [isOpen])

  const handleSlotChange = useCallback(
    (slotId: string, field: Exclude<keyof ProposedSlotDraft, "id">, value: string) => {
      setSlots((prev) =>
        prev.map((slot) => (slot.id === slotId ? { ...slot, [field]: value } : slot)),
      )
    },
    [],
  )

  const handleAddSlot = useCallback(() => {
    setSlots((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        startsAt: "",
        endsAt: "",
        location: "",
        meetingUrl: "",
      },
    ])
  }, [])

  const handleRemoveSlot = useCallback((slotId: string) => {
    setSlots((prev) => prev.filter((slot) => slot.id !== slotId))
  }, [])

  const handleSubmit = useCallback(async () => {
    const validSlots: Array<{
      startsAt: string
      endsAt: string
      location?: string
      meetingUrl?: string
    }> = []

    for (const slot of slots) {
      const startsAt = normalizeLocalDateTimeInput(slot.startsAt)
      const endsAt = normalizeLocalDateTimeInput(slot.endsAt)
      if (startsAt !== null && endsAt !== null) {
        validSlots.push({
          startsAt,
          endsAt,
          location: slot.location.trim() || undefined,
          meetingUrl: slot.meetingUrl.trim() || undefined,
        })
      }
    }

    await onSubmit({
      applicationId,
      note: note.trim() || undefined,
      slots: validSlots,
    })

    setSlots([
      {
        id: crypto.randomUUID(),
        startsAt: "",
        endsAt: "",
        location: "",
        meetingUrl: "",
      },
    ])
    setNote("")
  }, [slots, note, applicationId, onSubmit])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        {...reveal}
        transition={{ duration: 0.4, ease }}
        className={cn(
          "bg-background border border-border/50 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col",
          isSubmitting && "opacity-90",
        )}
      >
        <InterviewProposalModalHeader
          studentName={studentName}
          offerTitle={offerTitle}
          closeAriaLabel={t("interviewModal.closeAria")}
          isSubmitting={isSubmitting}
          onClose={onClose}
        />

        <div className="p-6 space-y-6 overflow-y-auto">
          <CompanySlotsEditor
            slots={slots}
            onSlotChange={handleSlotChange}
            onAddSlot={handleAddSlot}
            onRemoveSlot={handleRemoveSlot}
          />

          <div className="h-px bg-border/50" />

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {t("interviewModal.note")}
            </label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("interviewModal.notePlaceholder")}
              disabled={isSubmitting}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <InterviewProposalModalFooter
          cancelLabel={t("interviewModal.cancel")}
          submitLabel={t("interviewModal.submit")}
          isSubmitting={isSubmitting}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      </motion.div>
    </div>
  )
}
