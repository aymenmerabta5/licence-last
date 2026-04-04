import { describe, expect, test } from "bun:test"

import {
  getDocumentDirection,
  resolveDocumentLocale,
  resolveDocumentSettings,
} from "@/lib/document-locale"

describe("src/lib/document-locale", () => {
  test("defaults to english for missing or unsupported locales", () => {
    expect(resolveDocumentLocale(undefined)).toBe("en")
    expect(resolveDocumentLocale(null)).toBe("en")
    expect(resolveDocumentLocale("es")).toBe("en")
  })

  test("preserves supported locales", () => {
    expect(resolveDocumentLocale("en")).toBe("en")
    expect(resolveDocumentLocale("fr")).toBe("fr")
    expect(resolveDocumentLocale("ar")).toBe("ar")
  })

  test("maps arabic to rtl and latin locales to ltr", () => {
    expect(getDocumentDirection("ar")).toBe("rtl")
    expect(getDocumentDirection("en")).toBe("ltr")
    expect(getDocumentDirection("fr")).toBe("ltr")
  })

  test("returns the combined document settings", () => {
    expect(resolveDocumentSettings("ar")).toEqual({
      locale: "ar",
      direction: "rtl",
    })
  })
})
