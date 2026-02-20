import { afterEach, beforeEach, describe, expect, test } from "bun:test"

import {
  isInterviewsEnabledOnClient,
  isLanguageRequirementsEnabledOnClient,
  isNotificationPreferencesEnabledOnClient,
  isSavedOffersEnabledOnClient,
} from "@/lib/feature-flags-client"

const ORIGINAL_ENV = {
  NEXT_PUBLIC_FEATURE_SAVED_OFFERS:
    process.env.NEXT_PUBLIC_FEATURE_SAVED_OFFERS,
  NEXT_PUBLIC_FEATURE_INTERVIEWS: process.env.NEXT_PUBLIC_FEATURE_INTERVIEWS,
  NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES:
    process.env.NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES,
  NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS:
    process.env.NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS,
}

function restoreFeatureFlagEnv() {
  const entries = Object.entries(ORIGINAL_ENV)
  for (const [key, value] of entries) {
    if (value === undefined) {
      delete process.env[key]
      continue
    }
    process.env[key] = value
  }
}

describe("feature-flags-client", () => {
  beforeEach(() => {
    restoreFeatureFlagEnv()
  })

  afterEach(() => {
    restoreFeatureFlagEnv()
  })

  test("saved offers is enabled unless explicitly false", () => {
    delete process.env.NEXT_PUBLIC_FEATURE_SAVED_OFFERS
    expect(isSavedOffersEnabledOnClient()).toBe(true)

    process.env.NEXT_PUBLIC_FEATURE_SAVED_OFFERS = "false"
    expect(isSavedOffersEnabledOnClient()).toBe(false)
  })

  test("interviews is enabled only when explicitly true", () => {
    delete process.env.NEXT_PUBLIC_FEATURE_INTERVIEWS
    expect(isInterviewsEnabledOnClient()).toBe(false)

    process.env.NEXT_PUBLIC_FEATURE_INTERVIEWS = "false"
    expect(isInterviewsEnabledOnClient()).toBe(false)

    process.env.NEXT_PUBLIC_FEATURE_INTERVIEWS = "true"
    expect(isInterviewsEnabledOnClient()).toBe(true)
  })

  test("notification preferences is enabled only when explicitly true", () => {
    delete process.env.NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES
    expect(isNotificationPreferencesEnabledOnClient()).toBe(false)

    process.env.NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES = "false"
    expect(isNotificationPreferencesEnabledOnClient()).toBe(false)

    process.env.NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES = "true"
    expect(isNotificationPreferencesEnabledOnClient()).toBe(true)
  })

  test("language requirements is enabled only when explicitly true", () => {
    delete process.env.NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS
    expect(isLanguageRequirementsEnabledOnClient()).toBe(false)

    process.env.NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS = "false"
    expect(isLanguageRequirementsEnabledOnClient()).toBe(false)

    process.env.NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS = "true"
    expect(isLanguageRequirementsEnabledOnClient()).toBe(true)
  })
})
