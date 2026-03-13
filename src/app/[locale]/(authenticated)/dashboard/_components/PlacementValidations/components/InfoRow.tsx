import type { ReactNode } from "react"

interface InfoRowProps {
  label: string
  value: string | null | undefined
  icon?: ReactNode
}

export function InfoRow({ label, value, icon }: InfoRowProps) {
  if (!value) return null

  return (
    <div className="flex items-start gap-2">
      {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}
      <div className="min-w-0 flex-1">
        <span className="text-xs text-muted-foreground">{label}:</span>{" "}
        <span className="break-words text-foreground">{value}</span>
      </div>
    </div>
  )
}
