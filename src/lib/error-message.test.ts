import { describe, expect, test } from "bun:test"

import {
  getErrorMessage,
  resolveLocalizedError,
} from "@/lib/error-message"

describe("getErrorMessage", () => {
  test("should extract message from Error instance", () => {
    expect(getErrorMessage(new Error("something broke"))).toBe(
      "something broke",
    )
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

describe("resolveLocalizedError", () => {
  const translations: Record<string, string> = {
    "errors.codes.ACCOUNT_SUSPENDED": "Compte suspendu.",
    "auth.login.error": "Identifiants invalides.",
    "errors.auth.captchaRequired": "Veuillez completer le CAPTCHA.",
    "errors.auth.rateLimitExceeded": "Trop de tentatives. Veuillez reessayer plus tard.",
    "errors.common.unexpected": "Une erreur inattendue est survenue.",
  }

  const t = Object.assign(
    (key: string) => translations[key] ?? key,
    { has: (key: string) => key in translations },
  )

  test("should resolve a translated message from error data.code", () => {
    const message = resolveLocalizedError(
      { data: { code: "ACCOUNT_SUSPENDED" } },
      {
        t,
        fallbackKey: "errors.common.unexpected",
      },
    )

    expect(message).toBe("Compte suspendu.")
  })

  test("should resolve a translated message from a mapped backend message", () => {
    const message = resolveLocalizedError(
      { message: "Missing CAPTCHA response" },
      {
        t,
        fallbackKey: "errors.common.unexpected",
        messageMap: {
          "missing captcha response": "errors.auth.captchaRequired",
        },
      },
    )

    expect(message).toBe("Veuillez completer le CAPTCHA.")
  })

  test("should resolve a translated message from a mapped status code", () => {
    const message = resolveLocalizedError(
      { status: 429 },
      {
        t,
        fallbackKey: "errors.common.unexpected",
        statusMap: {
          429: "errors.auth.rateLimitExceeded",
        },
      },
    )

    expect(message).toBe("Trop de tentatives. Veuillez reessayer plus tard.")
  })

  test("should use the translated fallback when no code mapping is available", () => {
    const message = resolveLocalizedError(
      { message: "Invalid credentials" },
      {
        t,
        fallbackKey: "auth.login.error",
      },
    )

    expect(message).toBe("Identifiants invalides.")
  })
})
