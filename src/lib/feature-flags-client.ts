export function isSavedOffersEnabledOnClient() {
  return process.env.NEXT_PUBLIC_FEATURE_SAVED_OFFERS !== "false"
}

export function isInterviewsEnabledOnClient() {
  return process.env.NEXT_PUBLIC_FEATURE_INTERVIEWS !== "false"
}

export function isNotificationPreferencesEnabledOnClient() {
  return process.env.NEXT_PUBLIC_FEATURE_NOTIF_PREFERENCES !== "false"
}

export function isLanguageRequirementsEnabledOnClient() {
  return process.env.NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS !== "false"
}

export function isCompanyAssistantEnabledOnClient() {
  return process.env.NEXT_PUBLIC_FEATURE_COMPANY_ASSISTANT === "true"
}
