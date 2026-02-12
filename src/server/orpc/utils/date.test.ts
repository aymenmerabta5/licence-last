import { describe, expect, test } from "bun:test"

import { parseInputDate, validatePlacementDateRange } from "./date"

describe("src/server/orpc/utils/date", () => {
  test("parseInputDate should reject invalid input", () => {
    expect(() => parseInputDate("not-a-date", "Start date")).toThrow(
      "Start date is invalid",
    )
  })

  test("validatePlacementDateRange should reject same start and end date", () => {
    const date = new Date("2030-01-01T10:00:00.000Z")
    expect(() => validatePlacementDateRange(date, date, new Date("2029-01-01T00:00:00.000Z"))).toThrow(
      "Start date must be before end date",
    )
  })

  test("validatePlacementDateRange should reject past start date", () => {
    const startDate = new Date("2030-01-01T10:00:00.000Z")
    const endDate = new Date("2030-02-01T10:00:00.000Z")
    const now = new Date("2030-01-10T00:00:00.000Z")

    expect(() => validatePlacementDateRange(startDate, endDate, now)).toThrow(
      "Start date cannot be in the past",
    )
  })

  test("validatePlacementDateRange should accept valid future range", () => {
    const startDate = new Date("2030-01-10T10:00:00.000Z")
    const endDate = new Date("2030-02-01T10:00:00.000Z")
    const now = new Date("2030-01-01T00:00:00.000Z")

    expect(() => validatePlacementDateRange(startDate, endDate, now)).not.toThrow()
  })
})
