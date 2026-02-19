import { describe, expect, test } from "bun:test"

import {
  parseInputDate,
  validatePlacementDateRange,
} from "@/server/orpc/utils/date"

describe("src/server/orpc/utils/date", () => {
  test("parseInputDate should reject invalid input", () => {
    expect(() => parseInputDate("not-a-date", "Start date")).toThrow(
      "Start date is invalid",
    )
  })

  test("validatePlacementDateRange should reject same start and end date", () => {
    const date = new Date("2030-01-01T10:00:00.000Z")
    expect(() => validatePlacementDateRange(date, date)).toThrow(
      "Start date must be before end date",
    )
  })

  test("validatePlacementDateRange should reject start after end", () => {
    const startDate = new Date("2030-02-01T10:00:00.000Z")
    const endDate = new Date("2030-01-01T10:00:00.000Z")
    expect(() => validatePlacementDateRange(startDate, endDate)).toThrow(
      "Start date must be before end date",
    )
  })

  test("validatePlacementDateRange should accept valid range", () => {
    const startDate = new Date("2030-01-10T10:00:00.000Z")
    const endDate = new Date("2030-02-01T10:00:00.000Z")
    expect(() => validatePlacementDateRange(startDate, endDate)).not.toThrow()
  })

  test("validatePlacementDateRange should accept past start date", () => {
    const startDate = new Date("2020-01-01T10:00:00.000Z")
    const endDate = new Date("2030-02-01T10:00:00.000Z")
    expect(() => validatePlacementDateRange(startDate, endDate)).not.toThrow()
  })
})
