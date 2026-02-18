"use client"

import { useMemo, useState } from "react"

import type { ProposedSlotDraft } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"

type SlotField = Exclude<keyof ProposedSlotDraft, "id">

function createEmptySlot(): ProposedSlotDraft {
  return {
    id: crypto.randomUUID(),
    startsAt: "",
    endsAt: "",
    location: "",
    meetingUrl: "",
  }
}

export function useInterviewsState() {
  const [selectedOfferId, setSelectedOfferId] = useState("")
  const [applicationId, setApplicationId] = useState("")
  const [note, setNote] = useState("")
  const [slots, setSlots] = useState<ProposedSlotDraft[]>([createEmptySlot()])

  const hasValidSlot = useMemo(
    () =>
      slots.some(
        (slot) =>
          slot.startsAt.trim().length > 0 && slot.endsAt.trim().length > 0,
      ),
    [slots],
  )

  const canSubmitProposal = applicationId.trim().length > 0 && hasValidSlot

  const updateSlot = (slotId: string, field: SlotField, value: string) => {
    setSlots((current) =>
      current.map((slot) =>
        slot.id === slotId ? { ...slot, [field]: value } : slot,
      ),
    )
  }

  const addSlot = () => {
    setSlots((current) => [...current, createEmptySlot()])
  }

  const removeSlot = (slotId: string) => {
    setSlots((current) => {
      if (current.length === 1) {
        return current
      }
      return current.filter((slot) => slot.id !== slotId)
    })
  }

  const selectOffer = (offerId: string) => {
    setSelectedOfferId(offerId)
    setApplicationId("")
  }

  const resetProposalForm = () => {
    setApplicationId("")
    setNote("")
    setSlots([createEmptySlot()])
  }

  return {
    selectedOfferId,
    applicationId,
    note,
    slots,
    canSubmitProposal,
    setApplicationId,
    setNote,
    updateSlot,
    addSlot,
    removeSlot,
    selectOffer,
    resetProposalForm,
  }
}
