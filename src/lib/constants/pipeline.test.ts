import { describe, expect, test } from "bun:test"

import { canTransitionStage } from "@/lib/constants/pipeline"

describe("canTransitionStage", () => {
  test("allows valid forward transitions", () => {
    expect(canTransitionStage("applied", "screening")).toBe(true)
    expect(canTransitionStage("screening", "offer")).toBe(true)
  })

  test("blocks all backward transitions", () => {
    expect(canTransitionStage("screening", "applied")).toBe(false)
    expect(canTransitionStage("interview", "screening")).toBe(false)
    expect(canTransitionStage("interview", "applied")).toBe(false)
    expect(canTransitionStage("offer", "interview")).toBe(false)
    expect(canTransitionStage("offer", "screening")).toBe(false)
    expect(canTransitionStage("offer", "applied")).toBe(false)
  })

  test("blocks invalid and skipped transitions", () => {
    expect(canTransitionStage("applied", "accepted")).toBe(false)
    expect(canTransitionStage("screening", "accepted")).toBe(false)
    expect(canTransitionStage("applied", "rejected")).toBe(false)
  })

  test("allows forward terminal transitions from late stages", () => {
    expect(canTransitionStage("interview", "accepted")).toBe(true)
    expect(canTransitionStage("interview", "rejected")).toBe(true)
    expect(canTransitionStage("offer", "accepted")).toBe(true)
    expect(canTransitionStage("offer", "rejected")).toBe(true)
  })

  test("blocks all transitions from terminal stages", () => {
    expect(canTransitionStage("accepted", "interview")).toBe(false)
    expect(canTransitionStage("accepted", "offer")).toBe(false)
    expect(canTransitionStage("rejected", "applied")).toBe(false)
    expect(canTransitionStage("rejected", "offer")).toBe(false)
  })
})
