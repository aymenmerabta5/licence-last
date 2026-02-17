import { Label } from "@/components/ui/label"

interface FilterSectionProps {
  label: string
  count?: number
  children: React.ReactNode
}

export function FilterSection({ label, count, children }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-foreground/10">
        <Label className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/60 [[dir=rtl]_&]:tracking-normal">
          {label}
        </Label>
        {count != null && count > 0 && (
          <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 min-w-[18px] text-center">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

