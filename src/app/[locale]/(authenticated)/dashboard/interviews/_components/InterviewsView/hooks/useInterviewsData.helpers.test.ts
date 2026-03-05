import { describe, expect, test } from "bun:test"

import { normalizeLocalDateTimeInput } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData.helpers"

describe("useInterviewsData.helpers", () => {
  test("normalizeLocalDateTimeInput converts local datetime-local values to ISO", () => {
    const localValue = "2026-02-20T10:30"
    const normalized = normalizeLocalDateTimeInput(localValue)

    expect(normalized).not.toBeNull()
    expect(normalized?.endsWith("Z")).toBe(true)
    expect(new Date(normalized ?? "").getTime()).toBe(new Date(localValue).getTime())
  })

  test("normalizeLocalDateTimeInput returns null for invalid values", () => {
    expect(normalizeLocalDateTimeInput("not-a-date")).toBeNull()
  })
})
