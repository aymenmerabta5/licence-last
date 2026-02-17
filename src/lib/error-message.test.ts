import { describe, test, expect } from "bun:test"

import { getErrorMessage } from "@/lib/error-message"

describe("getErrorMessage", () => {
  test("should extract message from Error instance", () => {
    expect(getErrorMessage(new Error("something broke"))).toBe("something broke")
  })

  test("should extract message from object with message property", () => {
    expect(getErrorMessage({ message: "bad request" })).toBe("bad request")
  })

  test("should extract error from object with error property", () => {
    expect(getErrorMessage({ error: "unauthorized" })).toBe("unauthorized")
  })

  test("should prefer message over error when both exist", () => {
    expect(getErrorMessage({ message: "msg", error: "err" })).toBe("msg")
  })

  test("should return string errors directly", () => {
    expect(getErrorMessage("plain string error")).toBe("plain string error")
  })

  test("should return fallback for null", () => {
    expect(getErrorMessage(null)).toBe("An error occurred")
  })

  test("should return fallback for undefined", () => {
    expect(getErrorMessage(undefined)).toBe("An error occurred")
  })

  test("should return fallback for number", () => {
    expect(getErrorMessage(42)).toBe("An error occurred")
  })

  test("should return custom fallback when provided", () => {
    expect(getErrorMessage(null, "Custom fallback")).toBe("Custom fallback")
  })

  test("should return fallback for object with non-string message", () => {
    expect(getErrorMessage({ message: 123 })).toBe("An error occurred")
  })

  test("should return fallback for empty object", () => {
    expect(getErrorMessage({})).toBe("An error occurred")
  })
})
