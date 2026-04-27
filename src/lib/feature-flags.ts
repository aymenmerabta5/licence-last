import "server-only"

import { env } from "@/env"

const hasAiProviderConfig = Boolean(env.AI_API_KEY)

export const FEATURE_FLAGS = {
  NOTIF_PREFERENCES: env.FEATURE_NOTIF_PREFERENCES === "true",
  SAVED_OFFERS: env.FEATURE_SAVED_OFFERS === "true",
  INTERVIEWS: env.FEATURE_INTERVIEWS === "true",
  LANGUAGE_REQUIREMENTS: env.FEATURE_LANGUAGE_REQUIREMENTS === "true",
  COMPANY_ASSISTANT:
    env.FEATURE_COMPANY_ASSISTANT === "true" &&
    Boolean(env.ARCADE_API_KEY) &&
    hasAiProviderConfig,
} as const

export type ServerFeatureFlag = keyof typeof FEATURE_FLAGS

export function isFeatureEnabled(flag: ServerFeatureFlag) {
  return FEATURE_FLAGS[flag]
}
