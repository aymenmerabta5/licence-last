"use client"

import { Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface FormActionsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  isBusy: boolean
  onReset: () => void
}

export function FormActions({ form, isBusy, onReset }: FormActionsProps) {
  return (
    <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-xs text-muted-foreground/60 font-medium">
        Unsaved changes will be lost if you leave this page.
      </p>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button
          type="button"
          variant="editorial-ghost"
          size="editorial-sm"
          onClick={onReset}
          disabled={isBusy}
        >
          Discard
        </Button>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form.Subscribe
          selector={(state: any) => [state.isSubmitting] as const}
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {([isSubmitting]: any) => (
            <Button
              type="submit"
              variant="editorial"
              size="editorial"
              disabled={isBusy || isSubmitting}
              className="gap-2 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          )}
        </form.Subscribe>
      </div>
    </div>
  )
}
