import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

type Locale = "ar" | "en" | "fr"

function readLocale(locale: Locale) {
  return JSON.parse(
    readFileSync(`src/messages/${locale}.json`, "utf8"),
  ) as Record<string, unknown>
}

function flattenMessages(
  value: Record<string, unknown>,
  prefix = "",
  output: Record<string, string> = {},
) {
  for (const [key, current] of Object.entries(value)) {
    const nextKey = prefix ? `${prefix}.${key}` : key

    if (current && typeof current === "object" && !Array.isArray(current)) {
      flattenMessages(current as Record<string, unknown>, nextKey, output)
      continue
    }

    output[nextKey] = String(current)
  }

  return output
}

const NON_ENGLISH_NAMESPACES = [
  "auth.validation.",
  "auth.resetPassword.",
  "errors.",
  "dashboard.company.profile.deleteCompany.",
  "dashboard.admin.companies.",
]

const ENGLISH_LEAK_PATTERN =
  /\b(please|failed|delete company|company validation|all statuses|approve|reject company|reactivate|download verification doc|verification document|cancel|type company name to confirm|something went wrong)\b/i

describe("locale message parity", () => {
  test("should keep Arabic and French key sets aligned with English", () => {
    const englishKeys = Object.keys(flattenMessages(readLocale("en"))).sort()

    for (const locale of ["fr", "ar"] as const) {
      const localeKeys = Object.keys(flattenMessages(readLocale(locale))).sort()
      expect(localeKeys).toEqual(englishKeys)
    }
  })

  test("should not leave targeted English error copy in Arabic or French", () => {
    for (const locale of ["fr", "ar"] as const) {
      const flattened = flattenMessages(readLocale(locale))
      const englishLeaks = Object.entries(flattened).filter(([key, value]) => {
        return (
          NON_ENGLISH_NAMESPACES.some((prefix) => key.startsWith(prefix)) &&
          ENGLISH_LEAK_PATTERN.test(value)
        )
      })

      expect(englishLeaks).toEqual([])
    }
  })
})
