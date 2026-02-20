export function isSavedOffersEnabledOnClient() {
  return process.env.NEXT_PUBLIC_FEATURE_SAVED_OFFERS !== "false"
}

export function isInterviewsEnabledOnClient() {
  return process.env.NEXT_PUBLIC_FEATURE_INTERVIEWS === "true"
}

export function isNotificationPreferencesEnabledOnClient() {
  return process.env.NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES === "true"
}

export function isLanguageRequirementsEnabledOnClient() {
  return process.env.NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS === "true"
}
