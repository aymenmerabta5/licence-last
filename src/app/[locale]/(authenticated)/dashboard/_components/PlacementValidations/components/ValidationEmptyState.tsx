"use client"

interface ValidationEmptyStateProps {
  label: string
}

export function ValidationEmptyState({ label }: ValidationEmptyStateProps) {
  return (
    <div className="border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
      {label}
    </div>
  )
}
