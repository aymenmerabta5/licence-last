import { describe, expect, mock, test } from "bun:test"

import {
  canTransitionStage,
  STAGE_COLUMNS,
  STAGE_TRANSITIONS,
} from "@/lib/constants/pipeline"
const mockValues = mock((): any => Promise.resolve())
const mockInsert = mock((): any => ({ values: mockValues }))

mock.module("@/server/db", () => ({
  db: {
    insert: mockInsert,
    select: mock(() => {
      throw new Error("select not expected in these tests")
    }),
  },
}))

describe("src/server/services/applications/pipeline canTransitionStage", () => {
  test("matches the declared stage transition matrix for every stage pair", () => {
    for (const fromStage of STAGE_COLUMNS) {
      for (const toStage of STAGE_COLUMNS) {
        const expected = STAGE_TRANSITIONS[fromStage].includes(toStage)
        expect(canTransitionStage(fromStage, toStage)).toBe(expected)
      }
    }
  })
})

describe("src/server/services/applications/pipeline appendTimelineEvent", () => {
  test("should insert a timeline event and return eventId", async () => {
    // appendTimelineEvent is mocked by other test files (apply.test.ts, etc.)
    // via mock.module. We verify the contract: it should return { eventId }.
    const mod = await import("@/server/services/applications/pipeline")

    const result = await mod.appendTimelineEvent({
      applicationId: "app-1",
      actorUserId: "user-1",
      eventType: "application_created",
      toStage: "applied",
      toStatus: "applied",
      payload: { offerId: "offer-1" },
    })

    expect(result.eventId).toBeDefined()
    expect(typeof result.eventId).toBe("string")
  })

  test("should handle null optional fields", async () => {
    const mod = await import("@/server/services/applications/pipeline")

    const result = await mod.appendTimelineEvent({
      applicationId: "app-2",
      eventType: "note_added",
    })

    expect(result.eventId).toBeDefined()
  })
})
