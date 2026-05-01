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

function isSlotTimeValid(slot: ProposedSlotDraft): boolean {
  if (!slot.startsAt || !slot.endsAt) return false
  return new Date(slot.startsAt) < new Date(slot.endsAt)
}

function addOneHour(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  date.setHours(date.getHours() + 1)
  // Slice to "YYYY-MM-DDTHH:mm" format required by datetime-local
  return date.toISOString().slice(0, 16)
}

export function useInterviewsState() {
  const [selectedOfferId, setSelectedOfferId] = useState("")
  const [applicationId, setApplicationId] = useState("")
  const [note, setNote] = useState("")
  const [slots, setSlots] = useState<ProposedSlotDraft[]>([createEmptySlot()])

  const hasValidSlot = useMemo(
    () => slots.some((slot) => isSlotTimeValid(slot)),
    [slots],
  )

  const canSubmitProposal =
    selectedOfferId.trim().length > 0 &&
    applicationId.trim().length > 0 &&
    hasValidSlot

  const updateSlot = (slotId: string, field: SlotField, value: string) => {
    setSlots((current) =>
      current.map((slot) => {
        if (slot.id !== slotId) return slot

        const next = { ...slot, [field]: value }

        // Auto-populate end time to 1 hour after start when start changes
        // and end is empty or currently invalid
        if (
          field === "startsAt" &&
          value &&
          (!slot.endsAt || new Date(value) >= new Date(slot.endsAt))
        ) {
          next.endsAt = addOneHour(value)
        }

        return next
      }),
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
