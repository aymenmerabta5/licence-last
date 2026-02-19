import { describe, expect, test } from "bun:test"

import {
  asRecord,
  findLatestToolOutput,
  getNumber,
  getString,
  getStringArray,
  getStringProp,
} from "@/lib/ai/tool-output"

describe("asRecord", () => {
  test("should return object as Record", () => {
    const obj = { key: "value" }
    expect(asRecord(obj)).toBe(obj)
  })

  test("should return null for null", () => {
    expect(asRecord(null)).toBeNull()
  })

  test("should return null for string", () => {
    expect(asRecord("hello")).toBeNull()
  })

  test("should return null for number", () => {
    expect(asRecord(42)).toBeNull()
  })

  test("should return null for undefined", () => {
    expect(asRecord(undefined)).toBeNull()
  })
})

describe("getString", () => {
  test("should return string value", () => {
    expect(getString("hello")).toBe("hello")
  })

  test("should return null for number", () => {
    expect(getString(42)).toBeNull()
  })

  test("should return null for null", () => {
    expect(getString(null)).toBeNull()
  })

  test("should return null for object", () => {
    expect(getString({})).toBeNull()
  })
})

describe("getNumber", () => {
  test("should return finite number", () => {
    expect(getNumber(42)).toBe(42)
  })

  test("should return null for NaN", () => {
    expect(getNumber(NaN)).toBeNull()
  })

  test("should return null for Infinity", () => {
    expect(getNumber(Infinity)).toBeNull()
  })

  test("should return null for string", () => {
    expect(getNumber("42")).toBeNull()
  })

  test("should return 0 for zero", () => {
    expect(getNumber(0)).toBe(0)
  })
})

describe("getStringArray", () => {
  test("should return array of strings", () => {
    expect(getStringArray(["a", "b", "c"])).toEqual(["a", "b", "c"])
  })

  test("should filter out non-string values", () => {
    expect(getStringArray(["a", 42, null, "b"])).toEqual(["a", "b"])
  })

  test("should return empty array for non-array", () => {
    expect(getStringArray("not array")).toEqual([])
  })

  test("should return empty array for null", () => {
    expect(getStringArray(null)).toEqual([])
  })
})

describe("getStringProp", () => {
  test("should return string property value", () => {
    expect(getStringProp({ name: "Alice" }, "name")).toBe("Alice")
  })

  test("should return null for non-string property", () => {
    expect(getStringProp({ age: 25 }, "age")).toBeNull()
  })

  test("should return null for missing property", () => {
    expect(getStringProp({ name: "Alice" }, "email")).toBeNull()
  })

  test("should return null for null object", () => {
    expect(getStringProp(null, "name")).toBeNull()
  })
})

describe("findLatestToolOutput", () => {
  test("should find the latest matching tool output", () => {
    const messages = [
      {
        role: "assistant",
        parts: [
          {
            type: "dynamic-tool",
            toolName: "get-offers",
            state: "output-available",
            output: { data: "old" },
          },
        ],
      },
      {
        role: "assistant",
        parts: [
          {
            type: "dynamic-tool",
            toolName: "get-offers",
            state: "output-available",
            output: { data: "latest" },
          },
        ],
      },
    ]

    expect(findLatestToolOutput(messages, "get-offers")).toEqual({
      data: "latest",
    })
  })

  test("should return null when no matching tool found", () => {
    const messages = [
      {
        role: "assistant",
        parts: [
          {
            type: "dynamic-tool",
            toolName: "get-stats",
            state: "output-available",
            output: {},
          },
        ],
      },
    ]

    expect(findLatestToolOutput(messages, "get-offers")).toBeNull()
  })

  test("should skip non-assistant messages", () => {
    const messages = [
      {
        role: "user",
        parts: [
          {
            type: "dynamic-tool",
            toolName: "get-offers",
            state: "output-available",
            output: { data: "user" },
          },
        ],
      },
    ]

    expect(findLatestToolOutput(messages, "get-offers")).toBeNull()
  })

  test("should skip parts with wrong state", () => {
    const messages = [
      {
        role: "assistant",
        parts: [
          {
            type: "dynamic-tool",
            toolName: "get-offers",
            state: "loading",
            output: {},
          },
        ],
      },
    ]

    expect(findLatestToolOutput(messages, "get-offers")).toBeNull()
  })

  test("should return null for empty messages array", () => {
    expect(findLatestToolOutput([], "get-offers")).toBeNull()
  })

  test("should handle parts without output property", () => {
    const messages = [
      {
        role: "assistant",
        parts: [
          {
            type: "dynamic-tool",
            toolName: "get-offers",
            state: "output-available",
          },
        ],
      },
    ]

    expect(findLatestToolOutput(messages, "get-offers")).toBeNull()
  })
})
