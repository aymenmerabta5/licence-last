import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

interface CompanyDocumentsMessages {
  ownerOnlyGenerate?: string
}

interface LocaleMessages {
  dashboard?: {
    companyDocuments?: CompanyDocumentsMessages
  }
}

function readLocaleMessages(locale: "ar" | "en" | "fr") {
  return JSON.parse(
    readFileSync(`src/messages/${locale}.json`, "utf8"),
  ) as LocaleMessages
}

describe("company document translations", () => {
  test("ownerOnlyGenerate is defined in every supported locale", () => {
    for (const locale of ["en", "fr", "ar"] as const) {
      const messages = readLocaleMessages(locale)

      expect(messages.dashboard?.companyDocuments?.ownerOnlyGenerate).toEqual(
        expect.any(String),
      )
    }
  })
})
