import type { LucideIcon } from "lucide-react"

interface CompanyInfoFieldProps {
  icon: LucideIcon
  label: string
  value: string
}

export function CompanyInfoField({
  icon: Icon,
  label,
  value,
}: CompanyInfoFieldProps) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/40 font-bold mb-0.5 [[dir=rtl]_&]:tracking-normal">
          {label}
        </p>
        <p className="text-xs font-medium text-heading truncate">{value}</p>
      </div>
    </div>
  )
}
