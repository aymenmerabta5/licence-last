"use client"

interface CheckboxFieldProps {
  id: string
  label: React.ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  onBlur?: () => void
  error?: string
  className?: string
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
  onBlur,
  error,
  className,
}: CheckboxFieldProps) {
  return (
    <div className="space-y-2">
      <label className={`flex items-start gap-2.5 cursor-pointer select-none ${className ?? ""}`}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            onBlur={onBlur}
            className="peer h-4 w-4 appearance-none border border-border bg-transparent checked:bg-primary checked:border-primary focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors cursor-pointer"
          />
          <svg
            className="absolute h-3 w-3 text-primary-foreground pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <span className="text-sm text-muted-foreground leading-snug">
          {label}
        </span>
      </label>
      {error && (
        <p className="text-destructive text-[11px] tracking-wide" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
