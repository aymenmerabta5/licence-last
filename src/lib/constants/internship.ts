/**
 * Internship type constants shared across Admin validations, Explore,
 * and OfferDetail components.
 */

export const INTERNSHIP_TYPE_LABELS: Record<string, string> = {
  pfe: "PFE",
  immersion: "Immersion",
  summer: "Summer",
  practical: "Practical",
}

export const INTERNSHIP_TYPE_COLORS: Record<string, string> = {
  pfe: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  immersion:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  summer:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  practical:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
}
