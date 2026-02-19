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
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <div className="flex-1 min-w-0">
        <span className="text-muted-foreground text-xs">{label}:</span>{" "}
        <span className="text-foreground break-words">{value}</span>
      </div>
    </div>
  )
}
