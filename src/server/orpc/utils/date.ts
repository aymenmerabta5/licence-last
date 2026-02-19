export function parseInputDate(value: string, fieldLabel: string): Date {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldLabel} is invalid`)
  }
  return parsed
}

export function validatePlacementDateRange(
  startDate: Date,
  endDate: Date,
): void {
  if (startDate >= endDate) {
    throw new Error("Start date must be before end date")
  }
}
