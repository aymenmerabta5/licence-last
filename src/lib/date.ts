/**
 * Centralized date formatting utilities for the Stag application.
 * All date/time formatting functions should be imported from this file.
 */

type CompactRelativeLocale = "en" | "fr" | "ar"

interface CompactRelativeLabels {
  activeNow: string
  day: string
  hour: string
  minute: string
  now: string
  today: string
  yesterday: string
}

const DATE_FORMATTERS = new Map<string, Intl.DateTimeFormat>()
const NUMBER_FORMATTERS = new Map<string, Intl.NumberFormat>()
const RELATIVE_TIME_FORMATTERS = new Map<string, Intl.RelativeTimeFormat>()

const COMPACT_RELATIVE_LABELS: Record<
  CompactRelativeLocale,
  CompactRelativeLabels
> = {
  en: {
    activeNow: "Active now",
    day: "d",
    hour: "h",
    minute: "m",
    now: "now",
    today: "Today",
    yesterday: "Yesterday",
  },
  fr: {
    activeNow: "Actif maintenant",
    day: " j",
    hour: " h",
    minute: " min",
    now: "maint.",
    today: "Aujourd'hui",
    yesterday: "Hier",
  },
  ar: {
    activeNow: "نشط الآن",
    day: " ي",
    hour: " س",
    minute: " د",
    now: "الآن",
    today: "اليوم",
    yesterday: "أمس",
  },
}

function resolveLocale(locale?: string): string {
  if (locale?.trim()) {
    return locale
  }

  if (typeof document !== "undefined") {
    const documentLocale = document.documentElement.lang?.trim()

    if (documentLocale) {
      return documentLocale
    }
  }

  return "en"
}

function resolveCompactRelativeLocale(locale: string): CompactRelativeLocale {
  const normalizedLocale = locale.toLowerCase()

  if (normalizedLocale.startsWith("fr")) {
    return "fr"
  }

  if (normalizedLocale.startsWith("ar")) {
    return "ar"
  }

  return "en"
}

function getDateFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const cacheKey = `${locale}:${JSON.stringify(options)}`
  const cachedFormatter = DATE_FORMATTERS.get(cacheKey)

  if (cachedFormatter) {
    return cachedFormatter
  }

  const formatter = new Intl.DateTimeFormat(locale, options)
  DATE_FORMATTERS.set(cacheKey, formatter)

  return formatter
}

function getNumberFormatter(locale: string): Intl.NumberFormat {
  const cachedFormatter = NUMBER_FORMATTERS.get(locale)

  if (cachedFormatter) {
    return cachedFormatter
  }

  const formatter = new Intl.NumberFormat(locale)
  NUMBER_FORMATTERS.set(locale, formatter)

  return formatter
}

function getRelativeTimeFormatter(locale: string): Intl.RelativeTimeFormat {
  const cachedFormatter = RELATIVE_TIME_FORMATTERS.get(locale)

  if (cachedFormatter) {
    return cachedFormatter
  }

  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "always" })
  RELATIVE_TIME_FORMATTERS.set(locale, formatter)

  return formatter
}

function formatNumber(value: number, locale: string): string {
  return getNumberFormatter(locale).format(value)
}

function getCompactRelativeLabels(locale: string): CompactRelativeLabels {
  return COMPACT_RELATIVE_LABELS[resolveCompactRelativeLocale(locale)]
}

function formatShortDate(
  value: Date | string,
  locale: string,
  includeYear: boolean,
): string {
  return getDateFormatter(locale, {
    day: "numeric",
    month: "short",
    year: includeYear ? "numeric" : undefined,
  }).format(new Date(value))
}

// ============================================================================
// DATE FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format a date in medium style (e.g., "Jan 15, 2024")
 */
export function formatDate(value: Date | string, locale?: string): string {
  const resolvedLocale = resolveLocale(locale)

  return getDateFormatter(resolvedLocale, {
    dateStyle: "medium",
  }).format(new Date(value))
}

/**
 * Format a date in long style (e.g., "January 15, 2024")
 */
export function formatDateLong(value: Date | string, locale?: string): string {
  const resolvedLocale = resolveLocale(locale)

  return getDateFormatter(resolvedLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}

/**
 * Format a date with weekday (e.g., "Monday, January 15, 2024")
 */
export function formatDateFull(value: Date | string, locale?: string): string {
  const resolvedLocale = resolveLocale(locale)

  return getDateFormatter(resolvedLocale, {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  }).format(new Date(value))
}

// ============================================================================
// TIME FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format time using the locale's default short time style.
 */
export function formatTime(value: Date | string, locale?: string): string {
  const resolvedLocale = resolveLocale(locale)

  return getDateFormatter(resolvedLocale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

/**
 * Format time in 12h style (e.g., "2:30 PM")
 */
export function formatTime12h(value: Date | string, locale?: string): string {
  const resolvedLocale = resolveLocale(locale)

  return getDateFormatter(resolvedLocale, {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
  }).format(new Date(value))
}

/**
 * Format time as HH:mm string (e.g., "14:30")
 */
export function formatTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

// ============================================================================
// DATE + TIME FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format date and time together (e.g., "Jan 15, 2024, 2:30 PM")
 */
export function formatDateTime(value: Date | string, locale?: string): string {
  const resolvedLocale = resolveLocale(locale)

  return getDateFormatter(resolvedLocale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

/**
 * Format a time range in 24h format (e.g., "14:30 - 16:00")
 * Used for calendar displays
 */
export function formatTimeRange(startAt: Date, endAt: Date): string {
  const startStr = formatTimeString(startAt)
  const endStr = formatTimeString(endAt)

  return `${startStr} - ${endStr}`
}

/**
 * Format a time range in 12h format (e.g., "2:30 PM – 4:00 PM")
 */
export function formatTimeRange12h(
  start: Date | string,
  end: Date | string,
  locale?: string,
): string {
  const startStr = formatTime12h(start, locale)
  const endStr = formatTime12h(end, locale)

  return `${startStr} – ${endStr}`
}

/**
 * Format a schedule with smart same-day detection.
 */
export function formatSchedule(
  start: Date | string,
  end: Date | string,
  locale?: string,
): string {
  const resolvedLocale = resolveLocale(locale)
  const startDate = new Date(start)
  const endDate = new Date(end)
  const sameDay = startDate.toDateString() === endDate.toDateString()

  if (sameDay) {
    const sameDayTimeFormatter = getDateFormatter(resolvedLocale, {
      hour: "2-digit",
      minute: "2-digit",
    })

    return `${formatDate(startDate, resolvedLocale)} • ${sameDayTimeFormatter.format(startDate)} – ${sameDayTimeFormatter.format(endDate)}`
  }

  return `${formatDateTime(startDate, resolvedLocale)} → ${formatDateTime(endDate, resolvedLocale)}`
}

// ============================================================================
// RELATIVE DATE FORMATTING
// ============================================================================

/**
 * Format relative timestamp for compact display (e.g., "now", "5m", "2h", "3d")
 * Used in conversation lists, activity feeds, etc.
 */
export function formatRelativeTime(date: Date | string, locale?: string): string {
  const resolvedLocale = resolveLocale(locale)
  const labels = getCompactRelativeLabels(resolvedLocale)
  const now = new Date()
  const targetDate = new Date(date)
  const diff = now.getTime() - targetDate.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return labels.now
  if (minutes < 60) return `${formatNumber(minutes, resolvedLocale)}${labels.minute}`
  if (hours < 24) return `${formatNumber(hours, resolvedLocale)}${labels.hour}`
  if (days < 7) return `${formatNumber(days, resolvedLocale)}${labels.day}`

  return formatShortDate(
    targetDate,
    resolvedLocale,
    targetDate.getFullYear() !== now.getFullYear(),
  )
}

/**
 * Format relative time with full words (e.g., "Active now", "5 minutes ago")
 * Used in session/activity displays
 */
export function formatRelativeTimeLong(
  date: Date | string,
  locale?: string,
): string {
  const resolvedLocale = resolveLocale(locale)
  const labels = getCompactRelativeLabels(resolvedLocale)
  const now = new Date()
  const targetDate = new Date(date)
  const diffMs = now.getTime() - targetDate.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const relativeFormatter = getRelativeTimeFormatter(resolvedLocale)

  if (diffSec < 60) {
    return labels.activeNow
  }

  if (diffMin < 60) {
    return relativeFormatter.format(-diffMin, "minute")
  }

  if (diffHour < 24) {
    return relativeFormatter.format(-diffHour, "hour")
  }

  if (diffDay < 7) {
    return relativeFormatter.format(-diffDay, "day")
  }

  return formatShortDate(
    targetDate,
    resolvedLocale,
    targetDate.getFullYear() !== now.getFullYear(),
  )
}

/**
 * Format date as "Today", "Yesterday", or full date.
 * Used in message grouping headers
 */
export function formatDateHeader(
  dateString: string | Date,
  locale?: string,
): string {
  const resolvedLocale = resolveLocale(locale)
  const labels = getCompactRelativeLabels(resolvedLocale)
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return labels.today
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return labels.yesterday
  }

  return getDateFormatter(resolvedLocale, {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date)
}

// ============================================================================
// DATETIME-LOCAL INPUT UTILITIES
// ============================================================================

/**
 * Convert a Date to datetime-local input value (YYYY-MM-DDTHH:mm)
 * For creating new events/forms
 */
export function toDateTimeLocalInputValue(date: Date): string {
  const pad2 = (n: number) => n.toString().padStart(2, "0")
  const yyyy = date.getFullYear()
  const mm = pad2(date.getMonth() + 1)
  const dd = pad2(date.getDate())
  const hh = pad2(date.getHours())
  const min = pad2(date.getMinutes())

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

/**
 * Convert a Date/string to datetime-local input (for existing events)
 * Handles timezone offset for proper local display
 */
export function toDateTimeLocalInput(value?: Date | string | null): string {
  if (!value) return ""

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""

  const offset = parsed.getTimezoneOffset()
  const local = new Date(parsed.getTime() - offset * 60_000)

  return local.toISOString().slice(0, 16)
}

/**
 * Get the minimum datetime for date inputs (now)
 */
export function getNowMinDateTime(): string {
  return toDateTimeLocalInputValue(new Date())
}

/**
 * Add N days to a datetime-local input value and return a new datetime-local value
 */
export function addDaysToDateTimeLocalInputValue(
  value: string,
  days: number,
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return ""

  const yyyy = Number(match[1])
  const mm = Number(match[2])
  const dd = Number(match[3])
  const hh = Number(match[4])
  const min = Number(match[5])

  const date = new Date(yyyy, mm - 1, dd, hh, min, 0, 0)
  if (Number.isNaN(date.getTime())) return ""

  date.setDate(date.getDate() + days)
  return toDateTimeLocalInputValue(date)
}
