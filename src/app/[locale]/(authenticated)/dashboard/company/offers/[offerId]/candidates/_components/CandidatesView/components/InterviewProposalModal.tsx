"use client"

import { useTranslations } from "next-intl"
import { useCallback, useEffect, useState } from "react"

import { CalendarPlus, Loader2, X } from "lucide-react"
import * as motion from "motion/react-client"

import { Button } from "@/components/ui/button"
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
    slots: Array<{ startsAt: string; endsAt: string; location?: string; meetingUrl?: string }>
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
    { id: crypto.randomUUID(), startsAt: "", endsAt: "", location: "", meetingUrl: "" },
  ])
  const [note, setNote] = useState("")

  useEffect(() => {
    if (isOpen) {
      setSlots([
        { id: crypto.randomUUID(), startsAt: "", endsAt: "", location: "", meetingUrl: "" },
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
      { id: crypto.randomUUID(), startsAt: "", endsAt: "", location: "", meetingUrl: "" },
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
      { id: crypto.randomUUID(), startsAt: "", endsAt: "", location: "", meetingUrl: "" },
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
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border/50">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 shrink-0">
              <CalendarPlus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-heading tracking-tight">
                {t("interviewModal.title")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {studentName} — {offerTitle}
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label={t("interviewModal.closeAria")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
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

        {/* Footer */}
        <div className="flex gap-2 justify-end p-6 border-t border-border/50">
          <Button
            variant="editorial-outline"
            size="editorial-sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("interviewModal.cancel")}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="font-bold uppercase tracking-wider text-[11px]"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("interviewModal.submit")
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
