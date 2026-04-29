"use client"

import { Eye, EyeOff, Lock } from "lucide-react"
import { useState } from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"

interface PasswordFieldProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  hint?: string
  autoComplete?: string
  className?: string
}

export function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  hint,
  autoComplete = "new-password",
  className,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
      >
        {label}
      </Label>
      <InputGroup className={`rounded-none h-11 ${className ?? ""}`}>
        <InputGroupAddon align="inline-start">
          <Lock className="h-4 w-4" />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-[11px] tracking-wide" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground/60 tracking-wide">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
