import { describe, expect, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"

import { useInterviewsState } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsState"

describe("useInterviewsState", () => {
  test("requires selected offer before proposal can be submitted", () => {
    const { result } = renderHook(() => useInterviewsState())

    const slotId = result.current.slots[0]?.id
    if (!slotId) {
      throw new Error("Expected an initial slot")
    }

    act(() => {
      result.current.setApplicationId("app-1")
      result.current.updateSlot(slotId, "startsAt", "2026-02-20T10:00")
      result.current.updateSlot(slotId, "endsAt", "2026-02-20T11:00")
    })
    expect(result.current.canSubmitProposal).toBe(false)

    act(() => {
      result.current.selectOffer("offer-1")
    })
    expect(result.current.applicationId).toBe("")
    expect(result.current.canSubmitProposal).toBe(false)

    act(() => {
      result.current.setApplicationId("app-1")
    })
    expect(result.current.canSubmitProposal).toBe(true)
  })

  test("resets selected application when offer changes", () => {
    const { result } = renderHook(() => useInterviewsState())

    act(() => {
      result.current.setApplicationId("app-1")
      result.current.selectOffer("offer-1")
    })
    expect(result.current.applicationId).toBe("")
  })
})
