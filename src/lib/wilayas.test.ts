import { describe, test, expect } from "bun:test"

import { getWilayaName, WILAYAS, WILAYA_OPTIONS, WILAYA_OPTIONS_WITH_PLACEHOLDER } from "./wilayas"

describe("getWilayaName", () => {
  test("should return Adrar for code 1", () => {
    expect(getWilayaName(1)).toBe("Adrar")
  })

  test("should return Alger for code 16", () => {
    expect(getWilayaName(16)).toBe("Alger")
  })

  test("should return last wilaya for code 58", () => {
    expect(getWilayaName(58)).toBe("In Guezzam")
  })

  test("should return null for code 0", () => {
    expect(getWilayaName(0)).toBeNull()
  })

  test("should return null for code 59 (out of range)", () => {
    expect(getWilayaName(59)).toBeNull()
  })

  test("should return null for negative code", () => {
    expect(getWilayaName(-1)).toBeNull()
  })

  test("should return null for null", () => {
    expect(getWilayaName(null)).toBeNull()
  })

  test("should return null for undefined", () => {
    expect(getWilayaName(undefined)).toBeNull()
  })
})

describe("WILAYAS", () => {
  test("should have 58 entries", () => {
    expect(WILAYAS.length).toBe(58)
  })
})

describe("WILAYA_OPTIONS", () => {
  test("should have 58 options", () => {
    expect(WILAYA_OPTIONS.length).toBe(58)
  })

  test("should have correct format for first option", () => {
    expect(WILAYA_OPTIONS[0]).toEqual({ value: 1, label: "01 - Adrar" })
  })

  test("should have correct format for code 16 (Alger)", () => {
    expect(WILAYA_OPTIONS[15]).toEqual({ value: 16, label: "16 - Alger" })
  })
})

describe("WILAYA_OPTIONS_WITH_PLACEHOLDER", () => {
  test("should have 59 options (placeholder + 58 wilayas)", () => {
    expect(WILAYA_OPTIONS_WITH_PLACEHOLDER.length).toBe(59)
  })

  test("should have disabled placeholder as first option", () => {
    expect(WILAYA_OPTIONS_WITH_PLACEHOLDER[0]).toEqual({
      value: 0,
      label: "Select a wilaya",
      disabled: true,
    })
  })
})
