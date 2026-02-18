export function isLanguageRequirementsEnabledOnClient() {
  return process.env.NEXT_PUBLIC_FEATURE_LANGUAGE_REQUIREMENTS === "true"
}
