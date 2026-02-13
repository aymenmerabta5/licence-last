export function formatDate(
  date: Date | string | null,
  locale: string,
  fallback: string,
): string {
  if (!date) return fallback
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
