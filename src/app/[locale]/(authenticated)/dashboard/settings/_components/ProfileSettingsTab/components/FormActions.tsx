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
    <div className="pt-8 pb-4 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-6">
      <p className="text-xs text-muted-foreground/60 font-medium">
        Unsaved changes will be lost if you leave this page.
      </p>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Button
          type="button"
          variant="ghost"
          size="editorial-sm"
          className="rounded-xl px-6 hover:bg-secondary/30 h-11 w-full sm:w-auto"
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
              size="editorial-sm"
              className="rounded-xl px-8 h-11 shadow-[0_8px_20px_-8px_var(--color-primary)] hover:shadow-[0_12px_24px_-8px_var(--color-primary)] hover:-translate-y-0.5 transition-all duration-300 gap-2.5 w-full sm:w-auto text-sm font-bold active:translate-y-0"
              disabled={isBusy || isSubmitting}
              aria-label="Save profile changes"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-[spin_2s_linear_infinite]" />
              ) : (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  Commit Changes
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </div>
  )
}
