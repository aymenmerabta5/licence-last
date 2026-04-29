import type { LucideIcon } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"

interface TextFieldProps {
  id: string
  label: string
  placeholder?: string
  icon?: LucideIcon
  type?: "text" | "email" | "tel" | "url" | "number" | "date"
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  autoComplete?: string
  min?: string
  max?: string
  disabled?: boolean
  className?: string
}

export function TextField({
  id,
  label,
  placeholder,
  icon: Icon,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  autoComplete,
  min,
  max,
  disabled,
  className,
}: TextFieldProps) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
      >
        {label}
      </Label>
      <InputGroup className={`rounded-none h-11 ${className ?? ""}`}>
        {Icon && (
          <InputGroupAddon align="inline-start">
            <Icon className="h-4 w-4" />
          </InputGroupAddon>
        )}
        <InputGroupInput
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          min={min}
          max={max}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </InputGroup>
      {error && (
        <p id={`${id}-error`} className="text-destructive text-[11px] tracking-wide" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
