export const STATUS_STYLES: Record<string, string> = {
  applied: "bg-muted text-muted-foreground",
  company_accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  company_refused: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  admin_validated: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  admin_rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  withdrawn: "bg-muted text-muted-foreground/60",
}

export const STATUS_LABELS: Record<string, string> = {
  applied: "Pending",
  company_accepted: "Accepted",
  company_refused: "Refused",
  admin_validated: "Validated",
  admin_rejected: "Rejected",
  withdrawn: "Withdrawn",
}

export function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}
