import { describe, expect, test } from "bun:test"

import { canTransitionStage } from "@/lib/constants/pipeline"

describe("canTransitionStage", () => {
  test("allows valid forward transitions", () => {
    expect(canTransitionStage("applied", "screening")).toBe(true)
    expect(canTransitionStage("screening", "offer")).toBe(true)
  })

  test("allows configured backward transition", () => {
    expect(canTransitionStage("offer", "interview")).toBe(true)
  })

  test("blocks invalid transitions", () => {
    expect(canTransitionStage("offer", "applied")).toBe(false)
    expect(canTransitionStage("applied", "accepted")).toBe(false)
  })

  test("allows terminal transitions from late stages", () => {
    expect(canTransitionStage("interview", "accepted")).toBe(true)
    expect(canTransitionStage("interview", "rejected")).toBe(true)
    expect(canTransitionStage("offer", "accepted")).toBe(true)
    expect(canTransitionStage("offer", "rejected")).toBe(true)
  })

  test("blocks all transitions from terminal stages", () => {
    expect(canTransitionStage("accepted", "interview")).toBe(false)
    expect(canTransitionStage("rejected", "applied")).toBe(false)
  })
})
