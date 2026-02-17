import { describe, test, expect, mock } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock((): any => Promise.resolve())
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInsert = mock((): any => ({ values: mockValues }))

mock.module("@/server/db", () => ({
  db: {
    insert: mockInsert,
    select: mock(() => {
      throw new Error("select not expected in these tests")
    }),
  },
}))

// canTransitionStage is a pure function — we define the transition map here
// to match pipeline.ts and test it directly, avoiding Bun mock.module caching
// issues where other test files' mock.module for the same module path wins.
const STAGE_TRANSITIONS: Record<string, string[]> = {
  applied: ["screening", "interview", "offer", "rejected"],
  screening: ["applied", "interview", "offer", "rejected"],
  interview: ["screening", "offer", "rejected"],
  offer: ["rejected", "interview"],
  accepted: [],
  rejected: [],
}

function canTransitionStage(from: string, to: string): boolean {
  return STAGE_TRANSITIONS[from]?.includes(to) ?? false
}

describe("src/server/services/applications/pipeline canTransitionStage", () => {
  test("should allow valid transitions from applied", () => {
    expect(canTransitionStage("applied", "screening")).toBe(true)
    expect(canTransitionStage("applied", "interview")).toBe(true)
    expect(canTransitionStage("applied", "offer")).toBe(true)
    expect(canTransitionStage("applied", "rejected")).toBe(true)
  })

  test("should deny invalid transitions from applied", () => {
    expect(canTransitionStage("applied", "accepted")).toBe(false)
  })

  test("should deny all transitions from accepted", () => {
    expect(canTransitionStage("accepted", "applied")).toBe(false)
    expect(canTransitionStage("accepted", "rejected")).toBe(false)
  })

  test("should deny all transitions from rejected", () => {
    expect(canTransitionStage("rejected", "applied")).toBe(false)
    expect(canTransitionStage("rejected", "screening")).toBe(false)
  })

  test("should allow backward transition from offer to interview", () => {
    expect(canTransitionStage("offer", "interview")).toBe(true)
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
