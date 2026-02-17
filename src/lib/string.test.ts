import { describe, test, expect } from "bun:test"

import { formatPrice, getInitials } from "@/lib/string"

describe("src/lib/string", () => {
  describe("getInitials", () => {
    test("should return ? for nullish values", () => {
      expect(getInitials(null)).toBe("?")
      expect(getInitials(undefined)).toBe("?")
    })

    test("should return ? for empty string", () => {
      expect(getInitials("")).toBe("?")
    })

    test("should return initials for multi-word names", () => {
      expect(getInitials("John Doe")).toBe("JD")
      expect(getInitials("John Michael Doe")).toBe("JM")
    })

    test("should return single initial for single word", () => {
      expect(getInitials("Alice")).toBe("A")
    })

    test("should handle extra whitespace", () => {
      expect(getInitials("  john  doe ")).toBe("JD")
    })

    test("should handle punctuation within words", () => {
      expect(getInitials("Jean-Luc Picard")).toBe("JP")
    })
  })

  describe("formatPrice", () => {
    test("should append currency and include the amount digits", () => {
      const result = formatPrice(1000, "DZD")
      expect(result.endsWith(" DZD")).toBe(true)
      expect(result.replace(/\D/g, "")).toBe("1000")
    })
  })
})
