export function parseInputDate(value: string, fieldLabel: "Start date" | "End date"): Date {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldLabel} is invalid`)
  }
  return parsed
}

export function validatePlacementDateRange(startDate: Date, endDate: Date, now: Date = new Date()): void {
  if (startDate >= endDate) {
    throw new Error("Start date must be before end date")
  }

  if (startDate.getTime() < now.getTime()) {
    throw new Error("Start date cannot be in the past")
  }
}
