import "server-only"

function parseBooleanEnvFlag(value: string | undefined) {
  return value === "true"
}

export const FEATURE_FLAGS = {
  NOTIF_PREFERENCES: parseBooleanEnvFlag(process.env.FEATURE_NOTIF_PREFERENCES),
  SAVED_OFFERS: parseBooleanEnvFlag(process.env.FEATURE_SAVED_OFFERS),
  INTERVIEWS: parseBooleanEnvFlag(process.env.FEATURE_INTERVIEWS),
  LANGUAGE_REQUIREMENTS: parseBooleanEnvFlag(process.env.FEATURE_LANGUAGE_REQUIREMENTS),
} as const

export type ServerFeatureFlag = keyof typeof FEATURE_FLAGS

export function isFeatureEnabled(flag: ServerFeatureFlag) {
  return FEATURE_FLAGS[flag]
}
