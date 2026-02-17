import { describe, expect, test } from "bun:test"

import {
  captureReadinessSnapshotSchema,
  getMatchingScoreSchema,
  getReadinessHistorySchema,
  getSkillGapSchema,
} from "@/lib/schemas/matching"

describe("src/lib/schemas/matching", () => {
  test("getMatchingScoreSchema should require student and offer ids", () => {
    expect(
      getMatchingScoreSchema.safeParse({
        studentUserId: "student-1",
        offerId: "offer-1",
      }).success,
    ).toBe(true)

    expect(getMatchingScoreSchema.safeParse({ offerId: "offer-1" }).success).toBe(
      false,
    )
  })

  test("getSkillGapSchema should validate ids", () => {
    expect(
      getSkillGapSchema.safeParse({
        studentUserId: "student-1",
        offerId: "offer-1",
      }).success,
    ).toBe(true)
  })

  test("getReadinessHistorySchema should coerce limit", () => {
    const parsed = getReadinessHistorySchema.safeParse({
      studentUserId: "student-1",
      offerId: "offer-1",
      limit: "6",
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.limit).toBe(6)
    }
  })

  test("captureReadinessSnapshotSchema should default source", () => {
    const parsed = captureReadinessSnapshotSchema.safeParse({
      offerId: "offer-1",
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.source).toBe("offer_view")
    }
  })
})
