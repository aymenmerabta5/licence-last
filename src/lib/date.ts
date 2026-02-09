/**
 * Centralized date formatting utilities for the Internex application.
 * All date/time formatting functions should be imported from this file.
 */

// ============================================================================
// FORMATTERS (cached Intl.DateTimeFormat instances for performance)
// ============================================================================

const dateFormatterMedium = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

const dateFormatterLong = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const dateFormatterFull = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
});

const timeFormatter12h = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const dateTimeFormatterMedium = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

// ============================================================================
// DATE FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format a date in medium style (e.g., "Jan 15, 2024")
 */
export function formatDate(value: Date | string): string {
  return dateFormatterMedium.format(new Date(value));
}

/**
 * Format a date in long style (e.g., "January 15, 2024")
 */
export function formatDateLong(value: Date | string): string {
  return dateFormatterLong.format(new Date(value));
}

/**
 * Format a date with weekday (e.g., "Monday, January 15, 2024")
 */
export function formatDateFull(value: Date | string): string {
  return dateFormatterFull.format(new Date(value));
}

// ============================================================================
// TIME FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format time in 24h style with padding (e.g., "14:30")
 */
export function formatTime(value: Date | string): string {
  return timeFormatter.format(new Date(value));
}

/**
 * Format time in 12h style (e.g., "2:30 PM")
 */
export function formatTime12h(value: Date | string): string {
  return timeFormatter12h.format(new Date(value));
}

/**
 * Format time as HH:mm string (e.g., "14:30")
 */
export function formatTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

// ============================================================================
// DATE + TIME FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format date and time together (e.g., "Jan 15, 2024, 2:30 PM")
 */
export function formatDateTime(value: Date | string): string {
  return dateTimeFormatterMedium.format(new Date(value));
}

/**
 * Format a time range in 24h format (e.g., "14:30 - 16:00")
 * Used for calendar displays
 */
export function formatTimeRange(startAt: Date, endAt: Date): string {
  const startStr = formatTimeString(startAt);
  const endStr = formatTimeString(endAt);
  return `${startStr} - ${endStr}`;
}

/**
 * Format a time range in 12h format (e.g., "2:30 PM – 4:00 PM")
 */
export function formatTimeRange12h(
  start: Date | string,
  end: Date | string,
): string {
  const startStr = timeFormatter.format(new Date(start));
  const endStr = timeFormatter.format(new Date(end));
  return `${startStr} – ${endStr}`;
}

/**
 * Format a schedule with smart same-day detection
 * Same day: "Jan 15, 2024 • 2:30 PM – 4:00 PM"
 * Different days: "Jan 15, 2024, 2:30 PM → Jan 16, 2024, 4:00 PM"
 */
export function formatSchedule(
  start: Date | string,
  end: Date | string,
): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const sameDay = startDate.toDateString() === endDate.toDateString();

  if (sameDay) {
    return `${formatDate(start)} • ${startDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} – ${endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  return `${formatDateTime(start)} → ${formatDateTime(end)}`;
}

// ============================================================================
// RELATIVE DATE FORMATTING
// ============================================================================

/**
 * Format relative timestamp for compact display (e.g., "now", "5m", "2h", "3d")
 * Used in conversation lists, activity feeds, etc.
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diff = now.getTime() - targetDate.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format relative time with full words (e.g., "Active now", "5 minutes ago")
 * Used in session/activity displays
 */
export function formatRelativeTimeLong(date: Date | string): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now.getTime() - targetDate.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "Active now";
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  } else {
    return targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        targetDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

/**
 * Format date as "Today", "Yesterday", or full date
 * Used in message grouping headers
 */
export function formatDateHeader(dateString: string | Date): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// ============================================================================
// DATETIME-LOCAL INPUT UTILITIES
// ============================================================================

/**
 * Convert a Date to datetime-local input value (YYYY-MM-DDTHH:mm)
 * For creating new events/forms
 */
export function toDateTimeLocalInputValue(date: Date): string {
  const pad2 = (n: number) => n.toString().padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const min = pad2(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

/**
 * Convert a Date/string to datetime-local input (for existing events)
 * Handles timezone offset for proper local display
 */
export function toDateTimeLocalInput(value?: Date | string | null): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const offset = parsed.getTimezoneOffset();
  const local = new Date(parsed.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

/**
 * Get the minimum datetime for date inputs (now)
 */
export function getNowMinDateTime(): string {
  return toDateTimeLocalInputValue(new Date());
}

/**
 * Add N days to a datetime-local input value and return a new datetime-local value
 */
export function addDaysToDateTimeLocalInputValue(
  value: string,
  days: number,
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return "";

  const yyyy = Number(match[1]);
  const mm = Number(match[2]);
  const dd = Number(match[3]);
  const hh = Number(match[4]);
  const min = Number(match[5]);

  const date = new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
  if (Number.isNaN(date.getTime())) return "";

  date.setDate(date.getDate() + days);
  return toDateTimeLocalInputValue(date);
}
