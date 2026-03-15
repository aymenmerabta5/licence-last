import { describe, expect, test } from "bun:test"

import {
  mapCompanyApplications,
  mapCompanyOffers,
  normalizeLocalDateTimeInput,
} from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData.helpers"

describe("useInterviewsData.helpers", () => {
  test("normalizeLocalDateTimeInput converts local datetime-local values to ISO", () => {
    const localValue = "2026-02-20T10:30"
    const normalized = normalizeLocalDateTimeInput(localValue)

    expect(normalized).not.toBeNull()
    expect(normalized?.endsWith("Z")).toBe(true)
    expect(new Date(normalized ?? "").getTime()).toBe(
      new Date(localValue).getTime(),
    )
  })

  test("normalizeLocalDateTimeInput returns null for invalid values", () => {
    expect(normalizeLocalDateTimeInput("not-a-date")).toBeNull()
  })

  test("mapCompanyApplications keeps only interview-eligible pipeline stages", () => {
    const applications = mapCompanyApplications([
      {
        id: "app-1",
        student: { name: "Alex" },
        pipelineStage: "screening",
        createdAt: "2026-02-20T10:00:00.000Z",
      },
      {
        id: "app-2",
        student: { name: "Sam" },
        pipelineStage: "offer",
        createdAt: "2026-02-20T11:00:00.000Z",
      },
    ])

    expect(applications).toEqual([
      {
        id: "app-1",
        studentName: "Alex",
        pipelineStage: "screening",
        createdAt: "2026-02-20T10:00:00.000Z",
      },
    ])
  })

  test("mapping helpers return empty arrays for unexpected payloads", () => {
    expect(
      mapCompanyOffers({} as unknown as Array<{ id: string; title: string }>),
    ).toEqual([])
    expect(
      mapCompanyApplications(
        {} as unknown as Array<{
          id: string
          student: { name: string | null }
          pipelineStage: string
          createdAt: string
        }>,
      ),
    ).toEqual([])
  })
})
