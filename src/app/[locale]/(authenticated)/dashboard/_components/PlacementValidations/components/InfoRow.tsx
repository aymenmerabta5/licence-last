import type { ReactNode } from "react"

interface InfoRowProps {
  label: string
  value: string | null | undefined
  icon?: ReactNode
}

export function InfoRow({ label, value, icon }: InfoRowProps) {
  if (!value) return null

  return (
    <div className="flex items-start gap-2.5 py-1">
      {icon && <span className="mt-0.5 text-muted-foreground/70">{icon}</span>}
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
          {label}
        </span>
        <p className="break-words text-sm text-foreground leading-relaxed">
          {value}
        </p>
      </div>
    </div>
  )
}
