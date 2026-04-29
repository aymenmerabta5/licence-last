"use client"

import type { LucideIcon } from "lucide-react"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const stringValue = value === 0 && placeholder ? "" : String(value ?? "")

  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
      >
        {label}
      </Label>
      <Select
        value={stringValue}
        onValueChange={(v) => v && onChange(String(v))}
        disabled={disabled}
        items={options.map((o) => ({
          value: String(o.value),
          label: String(o.label),
        }))}
      >
        <InputGroup className={`rounded-none h-11 ${className ?? ""}`}>
          {Icon && (
            <InputGroupAddon align="inline-start">
              <Icon className="h-4 w-4" />
            </InputGroupAddon>
          )}
          <SelectTrigger
            id={id}
            onBlur={onBlur}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className="h-full w-full border-0 bg-transparent shadow-none ring-0 hover:border-0 focus-visible:ring-0 focus-visible:border-0"
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </InputGroup>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={String(option.value)}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p id={`${id}-error`} className="text-destructive text-[11px] tracking-wide" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
