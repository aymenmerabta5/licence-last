export const STATUS_STYLES: Record<string, string> = {
  applied: "bg-muted text-muted-foreground",
  company_accepted:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  company_refused:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  admin_validated:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  admin_rejected:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  withdrawn: "bg-muted text-muted-foreground/60",
}

export const STATUS_TRANSLATION_KEYS: Record<string, string> = {
  applied: "applied",
  company_accepted: "company_accepted",
  company_refused: "company_refused",
  admin_validated: "admin_validated",
  admin_rejected: "admin_rejected",
  withdrawn: "withdrawn",
}

export function relativeTime(isoDate: string, locale: string): string {
  const targetTime = new Date(isoDate).getTime()
  if (Number.isNaN(targetTime)) {
    return ""
  }

  const diffMinutes = Math.round((targetTime - Date.now()) / 60000)
  const absMinutes = Math.abs(diffMinutes)
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (absMinutes < 60) {
    return formatter.format(diffMinutes, "minute")
  }

  const diffHours = Math.round(diffMinutes / 60)
  const absHours = Math.abs(diffHours)
  if (absHours < 24) {
    return formatter.format(diffHours, "hour")
  }

  const diffDays = Math.round(diffHours / 24)
  const absDays = Math.abs(diffDays)
  if (absDays < 30) {
    return formatter.format(diffDays, "day")
  }

  const diffMonths = Math.round(diffDays / 30)
  return formatter.format(diffMonths, "month")
}
