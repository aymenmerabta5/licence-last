import { describe, expect, test } from "bun:test"

import {
  isBrokenTranslationString,
  mergeMessagesWithFallback,
} from "@/i18n/messages"

describe("src/i18n/messages", () => {
  test("detects placeholder strings made of question marks", () => {
    expect(isBrokenTranslationString("???? ??????")).toBe(true)
    expect(isBrokenTranslationString("Valid translation")).toBe(false)
  })

  test("replaces broken nested translations with fallback values", () => {
    const merged = mergeMessagesWithFallback(
      {
        pages: {
          privacy: {
            title: "????? ????????",
            description: "Valid Arabic translation",
          },
        },
      },
      {
        pages: {
          privacy: {
            title: "Privacy Policy",
            description: "Privacy description",
          },
        },
      },
    )

    expect(merged.pages.privacy.title).toBe("Privacy Policy")
    expect(merged.pages.privacy.description).toBe("Valid Arabic translation")
  })
})
