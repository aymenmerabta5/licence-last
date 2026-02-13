"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface FormActionsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  isBusy: boolean
  onReset: () => void
}

export function FormActions({ form, isBusy, onReset }: FormActionsProps) {
  return (
    <div className="pt-6 flex justify-end gap-3">
      <Button
        type="button"
        variant="editorial-outline"
        className="rounded-xl h-12 px-8 bg-background border-border/40"
        onClick={onReset}
        disabled={isBusy}
      >
        Cancel
      </Button>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form.Subscribe selector={(state: any) => [state.isSubmitting] as const}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {([isSubmitting]: any) => (
          <Button
            type="submit"
            variant="editorial"
            className="rounded-xl h-12 px-8 shadow-lg shadow-primary/20"
            disabled={isBusy || isSubmitting}
            aria-label="Save profile changes"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        )}
      </form.Subscribe>
    </div>
  )
}
