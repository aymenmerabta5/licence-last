import { describe, test, expect } from "bun:test"

import {
  formatDate,
  formatDateLong,
  formatDateFull,
  formatTime,
  formatTime12h,
  formatTimeString,
  formatDateTime,
  formatTimeRange,
  formatTimeRange12h,
  formatSchedule,
  formatRelativeTime,
  formatRelativeTimeLong,
  formatDateHeader,
  toDateTimeLocalInputValue,
  toDateTimeLocalInput,
  getNowMinDateTime,
  addDaysToDateTimeLocalInputValue,
} from "./date"

// Fixed date for deterministic tests
const JAN_15_2024 = new Date(2024, 0, 15, 14, 30, 0)
const JAN_16_2024 = new Date(2024, 0, 16, 16, 0, 0)

// ─── Date Formatting ───────────────────────────────────────────────────────

describe("formatDate", () => {
  test("should format Date object in medium style", () => {
    expect(formatDate(JAN_15_2024)).toBe("Jan 15, 2024")
  })

  test("should format ISO string", () => {
    expect(formatDate("2024-06-01T00:00:00.000Z")).toMatch(/Jun/)
  })
})

describe("formatDateLong", () => {
  test("should format in long style", () => {
    expect(formatDateLong(JAN_15_2024)).toBe("January 15, 2024")
  })
})

describe("formatDateFull", () => {
  test("should include weekday", () => {
    expect(formatDateFull(JAN_15_2024)).toBe("Monday, January 15, 2024")
  })
})

// ─── Time Formatting ───────────────────────────────────────────────────────

describe("formatTimeString", () => {
  test("should format as HH:mm with zero padding", () => {
    expect(formatTimeString(new Date(2024, 0, 1, 9, 5))).toBe("09:05")
  })

  test("should format afternoon time", () => {
    expect(formatTimeString(JAN_15_2024)).toBe("14:30")
  })

  test("should format midnight as 00:00", () => {
    expect(formatTimeString(new Date(2024, 0, 1, 0, 0))).toBe("00:00")
  })
})

describe("formatTime", () => {
  test("should format time", () => {
    const result = formatTime(JAN_15_2024)
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})

describe("formatTime12h", () => {
  test("should include AM/PM", () => {
    const result = formatTime12h(JAN_15_2024)
    expect(result).toMatch(/PM/)
  })
})

// ─── Date+Time Formatting ──────────────────────────────────────────────────

describe("formatDateTime", () => {
  test("should include both date and time", () => {
    const result = formatDateTime(JAN_15_2024)
    expect(result).toMatch(/Jan 15, 2024/)
  })
})

describe("formatTimeRange", () => {
  test("should format start-end in 24h format", () => {
    const start = new Date(2024, 0, 15, 14, 30)
    const end = new Date(2024, 0, 15, 16, 0)
    expect(formatTimeRange(start, end)).toBe("14:30 - 16:00")
  })
})

describe("formatTimeRange12h", () => {
  test("should format with en-dash separator", () => {
    const result = formatTimeRange12h(JAN_15_2024, JAN_16_2024)
    expect(result).toContain("–")
  })
})

describe("formatSchedule", () => {
  test("should use bullet separator for same-day events", () => {
    const start = new Date(2024, 0, 15, 14, 0)
    const end = new Date(2024, 0, 15, 16, 0)
    const result = formatSchedule(start, end)
    expect(result).toContain("•")
    expect(result).toMatch(/Jan 15, 2024/)
  })

  test("should use arrow separator for different-day events", () => {
    const result = formatSchedule(JAN_15_2024, JAN_16_2024)
    expect(result).toContain("→")
  })
})

// ─── Relative Time ─────────────────────────────────────────────────────────

describe("formatRelativeTime", () => {
  test("should return 'now' for very recent time", () => {
    const recent = new Date(Date.now() - 30_000) // 30 seconds ago
    expect(formatRelativeTime(recent)).toBe("now")
  })

  test("should return minutes for < 60 minutes", () => {
    const mins = new Date(Date.now() - 5 * 60_000) // 5 minutes ago
    expect(formatRelativeTime(mins)).toBe("5m")
  })

  test("should return hours for < 24 hours", () => {
    const hours = new Date(Date.now() - 3 * 3600_000) // 3 hours ago
    expect(formatRelativeTime(hours)).toBe("3h")
  })

  test("should return days for < 7 days", () => {
    const days = new Date(Date.now() - 2 * 86400_000) // 2 days ago
    expect(formatRelativeTime(days)).toBe("2d")
  })

  test("should return formatted date for >= 7 days", () => {
    const old = new Date(Date.now() - 14 * 86400_000) // 14 days ago
    const result = formatRelativeTime(old)
    expect(result).not.toMatch(/^\d+[mhd]$/)
  })
})

describe("formatRelativeTimeLong", () => {
  test("should return 'Active now' for < 60 seconds", () => {
    const recent = new Date(Date.now() - 30_000)
    expect(formatRelativeTimeLong(recent)).toBe("Active now")
  })

  test("should return singular '1 minute ago'", () => {
    const oneMin = new Date(Date.now() - 60_000)
    expect(formatRelativeTimeLong(oneMin)).toBe("1 minute ago")
  })

  test("should return plural minutes", () => {
    const mins = new Date(Date.now() - 5 * 60_000)
    expect(formatRelativeTimeLong(mins)).toBe("5 minutes ago")
  })

  test("should return singular '1 hour ago'", () => {
    const oneHour = new Date(Date.now() - 3600_000)
    expect(formatRelativeTimeLong(oneHour)).toBe("1 hour ago")
  })

  test("should return plural hours", () => {
    const hours = new Date(Date.now() - 3 * 3600_000)
    expect(formatRelativeTimeLong(hours)).toBe("3 hours ago")
  })

  test("should return singular '1 day ago'", () => {
    const oneDay = new Date(Date.now() - 86400_000)
    expect(formatRelativeTimeLong(oneDay)).toBe("1 day ago")
  })

  test("should return plural days for < 7 days", () => {
    const days = new Date(Date.now() - 3 * 86400_000)
    expect(formatRelativeTimeLong(days)).toBe("3 days ago")
  })

  test("should return formatted date for >= 7 days", () => {
    const old = new Date(Date.now() - 14 * 86400_000)
    const result = formatRelativeTimeLong(old)
    expect(result).not.toContain("ago")
  })
})

// ─── Date Header ───────────────────────────────────────────────────────────

describe("formatDateHeader", () => {
  test("should return 'Today' for today's date", () => {
    expect(formatDateHeader(new Date())).toBe("Today")
  })

  test("should return 'Yesterday' for yesterday", () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(formatDateHeader(yesterday)).toBe("Yesterday")
  })

  test("should return formatted date for older dates", () => {
    const old = new Date(2024, 0, 1)
    const result = formatDateHeader(old)
    expect(result).toMatch(/January/)
  })
})

// ─── DateTime-local Input Utilities ────────────────────────────────────────

describe("toDateTimeLocalInputValue", () => {
  test("should format date as YYYY-MM-DDTHH:mm", () => {
    const date = new Date(2024, 0, 15, 14, 30)
    expect(toDateTimeLocalInputValue(date)).toBe("2024-01-15T14:30")
  })

  test("should zero-pad single digit months and days", () => {
    const date = new Date(2024, 0, 5, 9, 5)
    expect(toDateTimeLocalInputValue(date)).toBe("2024-01-05T09:05")
  })
})

describe("toDateTimeLocalInput", () => {
  test("should return empty string for null", () => {
    expect(toDateTimeLocalInput(null)).toBe("")
  })

  test("should return empty string for undefined", () => {
    expect(toDateTimeLocalInput(undefined)).toBe("")
  })

  test("should return empty string for empty value", () => {
    expect(toDateTimeLocalInput()).toBe("")
  })

  test("should return empty string for invalid date string", () => {
    expect(toDateTimeLocalInput("not-a-date")).toBe("")
  })

  test("should format valid date to YYYY-MM-DDTHH:mm", () => {
    const result = toDateTimeLocalInput("2024-01-15T14:30:00.000Z")
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
})

describe("getNowMinDateTime", () => {
  test("should return current date in YYYY-MM-DDTHH:mm format", () => {
    const result = getNowMinDateTime()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
})

describe("addDaysToDateTimeLocalInputValue", () => {
  test("should add days to valid datetime-local value", () => {
    expect(addDaysToDateTimeLocalInputValue("2024-01-15T14:30", 1)).toBe("2024-01-16T14:30")
  })

  test("should handle month rollover", () => {
    expect(addDaysToDateTimeLocalInputValue("2024-01-31T10:00", 1)).toBe("2024-02-01T10:00")
  })

  test("should handle year rollover", () => {
    expect(addDaysToDateTimeLocalInputValue("2024-12-31T23:59", 1)).toBe("2025-01-01T23:59")
  })

  test("should return empty string for invalid format", () => {
    expect(addDaysToDateTimeLocalInputValue("invalid", 1)).toBe("")
  })

  test("should return empty string for empty string", () => {
    expect(addDaysToDateTimeLocalInputValue("", 1)).toBe("")
  })
})
