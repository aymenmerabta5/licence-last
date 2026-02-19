export interface ValidationSummary {
  summaryBullets: string[]
  checklist: string[]
  potentialInconsistencies: string[]
}

export function toDateInputValue(
  value: Date | string | null | undefined,
): string {
  if (!value) return ""

  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ""

  return date.toISOString().split("T")[0]
}

export function isBeforeDate(dateA: string, dateB: string): boolean {
  return new Date(dateA).getTime() < new Date(dateB).getTime()
}

export function isAfterDate(dateA: string, dateB: string): boolean {
  return new Date(dateA).getTime() > new Date(dateB).getTime()
}
