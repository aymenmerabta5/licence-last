import type { LucideIcon } from "lucide-react"

import { Label } from "@/components/ui/label"

interface TextAreaFieldProps {
  id: string
  label: string
  placeholder?: string
  icon?: LucideIcon
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  rows?: number
  className?: string
}

export function TextAreaField({
  id,
  label,
  placeholder,
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
  rows = 3,
  className,
}: TextAreaFieldProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
      >
        {label}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute start-3 top-3 h-4 w-4 text-muted-foreground/60" />
        )}
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows}
          className={`w-full rounded-none border border-input bg-transparent ${Icon ? "ps-10" : "ps-3"} pe-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none ${className ?? ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="text-destructive text-[11px] tracking-wide"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
