import { describe, expect, test } from "bun:test"

import {
  extractTextFromParts,
  redactSecrets,
  stripProviderMetadata,
} from "@/server/services/assistant/utils"

describe("src/server/services/assistant/utils redactSecrets", () => {
  test("redacts token-like keys recursively", () => {
    const input = {
      token: "abc",
      nested: {
        authorization: "Bearer secret",
        safe: "ok",
        arr: [{ refresh_token: "x" }, { value: 12 }],
      },
    }

    expect(redactSecrets(input)).toEqual({
      token: "[REDACTED]",
      nested: {
        authorization: "[REDACTED]",
        safe: "ok",
        arr: [{ refresh_token: "[REDACTED]" }, { value: 12 }],
      },
    })
  })

  test("truncates on configured depth", () => {
    const input = { a: { b: { c: { d: "value" } } } }
    expect(redactSecrets(input, { maxDepth: 2 })).toEqual({
      a: { b: { c: "[TRUNCATED]" } },
    })
  })
})

describe("src/server/services/assistant/utils stripProviderMetadata", () => {
  test("removes provider metadata keys recursively", () => {
    const input = {
      providerMetadata: { source: "x" },
      parts: [
        { type: "text", text: "hello" },
        { callProviderMetadata: { provider: "foo" }, value: 1 },
      ],
      nested: {
        callProviderMetadata: { provider: "bar" },
        keep: true,
      },
    }

    expect(stripProviderMetadata(input)).toEqual({
      parts: [{ type: "text", text: "hello" }, { value: 1 }],
      nested: { keep: true },
    })
  })
})

describe("src/server/services/assistant/utils extractTextFromParts", () => {
  test("concatenates text parts and ignores non-text parts", () => {
    const parts: unknown[] = [
      { type: "text", text: "Hello " },
      { type: "tool-call", name: "doSomething" },
      { type: "text", text: "world" },
      null,
      "raw",
    ]

    expect(extractTextFromParts(parts)).toBe("Hello world")
  })
})

