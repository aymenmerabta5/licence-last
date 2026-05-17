"use client"

import { useMutation } from "@tanstack/react-query"
import { Loader2, Send } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import { CompanySlotsEditor } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/CompanySlotsEditor"
import type { ProposedSlotDraft } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { Button } from "@/components/ui/button"
import { ease, reveal } from "@/lib/animations"
import { resolveLocalizedError } from "@/lib/error-message"
import { orpc } from "@/server/orpc/client"

interface RescheduleSlotsInlineProps {
  interviewId: string
}

function createEmptySlot(): ProposedSlotDraft {
  return {
    id: crypto.randomUUID(),
    startsAt: "",
    endsAt: "",
    location: "",
    meetingUrl: "",
  }
}

export function RescheduleSlotsInline({
  interviewId,
}: RescheduleSlotsInlineProps) {
  const t = useTranslations("dashboard.interviews")
  const tCommon = useTranslations()
  const [slots, setSlots] = useState<ProposedSlotDraft[]>([createEmptySlot()])

  const mutation = useMutation({
    ...orpc.interviews.rescheduleSlots.mutationOptions(),
    onSuccess: () => {
      toast.success(t("rescheduleSuccess"))
      setSlots([createEmptySlot()])
    },
    onError: (error) => {
      toast.error(
        resolveLocalizedError(error, {
          t: tCommon,
          fallbackKey: "errors.common.generic",
        }),
      )
    },
  })

  const handleSlotChange = (
    slotId: string,
    field: keyof ProposedSlotDraft,
    value: string,
  ) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, [field]: value } : s)),
    )
  }

  const handleAddSlot = () => {
    if (slots.length >= 20) return
    setSlots((prev) => [...prev, createEmptySlot()])
  }

  const handleRemoveSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId))
  }

  const canSubmit = slots.every((s) => s.startsAt && s.endsAt)

  const handleSubmit = () => {
    if (!canSubmit) return
    mutation.mutate({
      interviewId,
      slots: slots.map((s) => ({
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        location: s.location || undefined,
        meetingUrl: s.meetingUrl || undefined,
      })),
    })
  }

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.4, ease }}
      className="space-y-4"
    >
      <CompanySlotsEditor
        slots={slots}
        onSlotChange={handleSlotChange}
        onAddSlot={handleAddSlot}
        onRemoveSlot={handleRemoveSlot}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          variant="editorial"
          size="sm"
          disabled={!canSubmit || mutation.isPending}
          className="gap-1.5"
          onClick={handleSubmit}
        >
          {mutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
          {mutation.isPending
            ? t("rescheduleSubmitting")
            : t("rescheduleSubmit")}
        </Button>
      </div>
    </motion.div>
  )
}
