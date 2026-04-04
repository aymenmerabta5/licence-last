import { describe, expect, test } from "bun:test"
import type { UIMessage } from "ai"

import {
  errorToText,
  extractTextFromParts,
  redactSecrets,
  sanitizeUIMessagesForModel,
  stripProviderMetadata,
} from "@/server/ai/sanitizer"

describe("sanitizer", () => {
  describe("sanitizeUIMessagesForModel", () => {
    test("removes message ids", () => {
      const messages: UIMessage[] = [
        {
          id: "msg-1",
          role: "user",
          parts: [{ type: "text", text: "Hello" }],
        },
      ]

      const sanitized = sanitizeUIMessagesForModel(messages)
      expect(sanitized[0]).not.toHaveProperty("id")
      expect(sanitized[0].role).toBe("user")
      expect(sanitized[0].parts).toEqual([{ type: "text", text: "Hello" }])
    })

    test("removes providerMetadata from parts", () => {
      const messages: UIMessage[] = [
        {
          id: "msg-1",
          role: "user",
          parts: [
            {
              type: "text",
              text: "Hello",
              providerMetadata: { someId: "123" },
            } as unknown as UIMessage["parts"][number],
          ],
        },
      ]

      const sanitized = sanitizeUIMessagesForModel(messages)
      const part = sanitized[0].parts[0] as Record<string, unknown>
      expect(part).not.toHaveProperty("providerMetadata")
      expect(part).not.toHaveProperty("callProviderMetadata")
    })

    test("removes callProviderMetadata from parts", () => {
      const messages: UIMessage[] = [
        {
          id: "msg-1",
          role: "user",
          parts: [
            {
              type: "text",
              text: "Hello",
              callProviderMetadata: { callId: "abc" },
            } as unknown as UIMessage["parts"][number],
          ],
        },
      ]

      const sanitized = sanitizeUIMessagesForModel(messages)
      const part = sanitized[0].parts[0] as Record<string, unknown>
      expect(part).not.toHaveProperty("callProviderMetadata")
    })

    test("preserves other part properties", () => {
      const messages: UIMessage[] = [
        {
          id: "msg-1",
          role: "user",
          parts: [{ type: "text", text: "Hello" }],
        },
      ]

      const sanitized = sanitizeUIMessagesForModel(messages)
      const part = sanitized[0].parts[0] as Record<string, unknown>
      expect(part.type).toBe("text")
      expect(part.text).toBe("Hello")
    })

    test("handles empty messages array", () => {
      const sanitized = sanitizeUIMessagesForModel([])
      expect(sanitized).toEqual([])
    })

    test("preserves multiple messages", () => {
      const messages: UIMessage[] = [
        { id: "1", role: "user", parts: [{ type: "text", text: "Hello" }] },
        {
          id: "2",
          role: "assistant",
          parts: [{ type: "text", text: "Hi there" }],
        },
      ]

      const sanitized = sanitizeUIMessagesForModel(messages)
      expect(sanitized).toHaveLength(2)
      expect(sanitized[0].role).toBe("user")
      expect(sanitized[1].role).toBe("assistant")
    })
  })

  describe("errorToText", () => {
    test("returns a safe generic message for string errors", () => {
      expect(errorToText("upstream provider exploded")).toBe(
        "The assistant is temporarily unavailable. Please try again.",
      )
    })

    test("returns a safe generic message for Error instances", () => {
      expect(errorToText(new Error("Something went wrong"))).toBe(
        "The assistant is temporarily unavailable. Please try again.",
      )
    })

    test("returns a safe generic message for other error shapes", () => {
      expect(errorToText({ foo: "bar" })).toBe(
        "The assistant is temporarily unavailable. Please try again.",
      )
    })

    test("returns a safe generic message for null", () => {
      expect(errorToText(null)).toBe(
        "The assistant is temporarily unavailable. Please try again.",
      )
    })

    test("returns a safe generic message for undefined", () => {
      expect(errorToText(undefined)).toBe(
        "The assistant is temporarily unavailable. Please try again.",
      )
    })
  })

  describe("redactSecrets", () => {
    test("redacts sensitive fields like tokens and passwords", () => {
      const data = {
        name: "John",
        api_key: "secret123",
        password: "mypassword",
        access_token: "token123",
        refreshToken: "refresh456",
        authorization: "Bearer token",
        secret_key: "secret789",
        normal_field: "value",
      }

      const result = redactSecrets(data) as Record<string, unknown>
      expect(result.api_key).toBe("[REDACTED]")
      expect(result.password).toBe("[REDACTED]")
      expect(result.access_token).toBe("[REDACTED]")
      expect(result.refreshToken).toBe("[REDACTED]")
      expect(result.authorization).toBe("[REDACTED]")
      expect(result.secret_key).toBe("[REDACTED]")
      expect(result.name).toBe("John")
      expect(result.normal_field).toBe("value")
    })

    test("preserves non-sensitive fields", () => {
      const data = {
        name: "John",
        age: 25,
        skills: ["React", "Node.js"],
      }

      const result = redactSecrets(data) as Record<string, unknown>
      expect(result.name).toBe("John")
      expect(result.age).toBe(25)
      expect(result.skills).toEqual(["React", "Node.js"])
    })

    test("handles nested objects", () => {
      const data = {
        user: {
          name: "John",
          password: "secret123",
        },
      }

      const result = redactSecrets(data) as Record<
        string,
        { name: string; password: string }
      >
      expect(result.user.name).toBe("John")
      expect(result.user.password).toBe("[REDACTED]")
    })
  })

  describe("stripProviderMetadata", () => {
    test("removes providerMetadata from parts", () => {
      const parts = [
        { type: "text", text: "Hello", providerMetadata: { id: "123" } },
      ]

      const result = stripProviderMetadata(
        parts as UIMessage["parts"],
      ) as Array<Record<string, unknown>>
      expect(result[0]).not.toHaveProperty("providerMetadata")
    })

    test("removes callProviderMetadata from parts", () => {
      const parts = [
        {
          type: "text",
          text: "Hello",
          callProviderMetadata: { callId: "abc" },
        },
      ]

      const result = stripProviderMetadata(
        parts as UIMessage["parts"],
      ) as Array<Record<string, unknown>>
      expect(result[0]).not.toHaveProperty("callProviderMetadata")
    })

    test("preserves other properties", () => {
      const parts = [{ type: "text", text: "Hello", someOtherProp: "value" }]

      const result = stripProviderMetadata(
        parts as UIMessage["parts"],
      ) as Array<Record<string, unknown>>
      expect(result[0]).toHaveProperty("someOtherProp")
    })
  })

  describe("extractTextFromParts", () => {
    test("extracts text from text parts", () => {
      const parts = [{ type: "text", text: "Hello world" }]
      expect(extractTextFromParts(parts)).toBe("Hello world")
    })

    test("joins multiple text parts", () => {
      const parts = [
        { type: "text", text: "Hello" },
        { type: "text", text: " " },
        { type: "text", text: "world" },
      ]
      expect(extractTextFromParts(parts)).toBe("Hello world")
    })

    test("skips non-text parts", () => {
      const parts = [
        { type: "text", text: "Hello" },
        { type: "tool-call", toolCallId: "123" },
        { type: "text", text: "world" },
      ]
      expect(extractTextFromParts(parts as unknown[])).toBe("Helloworld")
    })

    test("handles empty parts array", () => {
      expect(extractTextFromParts([])).toBe("")
    })

    test("handles parts without text property", () => {
      const parts = [
        { type: "text", text: "Hello" },
        { type: "text" },
        { type: "text", text: "world" },
      ]
      expect(extractTextFromParts(parts as unknown[])).toBe("Helloworld")
    })
  })
})
