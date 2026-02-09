import type { LucideIcon } from "lucide-react"

import { Label } from "@/components/ui/label"

interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface SelectFieldProps {
  id: string
  label: string
  placeholder?: string
  icon?: LucideIcon
  options: SelectOption[]
  value: string | number
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
  className?: string
}

export function SelectField({
  id,
  label,
  placeholder,
  icon: Icon,
  options,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}: SelectFieldProps) {
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
          <Icon className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
        )}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={`w-full h-11 rounded-none border border-input bg-transparent ${Icon ? "ps-10" : "ps-3"} pe-3 text-sm appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${className ?? ""}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="text-destructive text-[11px] tracking-wide" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
