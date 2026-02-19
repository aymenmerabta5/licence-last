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
    <div className="pt-4 border-t border-border/15">
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="editorial-outline"
          size="editorial-sm"
          className="rounded-xl px-6 bg-background border-border/40"
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
              className="rounded-xl px-6 shadow-md shadow-primary/15 gap-2"
              disabled={isBusy || isSubmitting}
              aria-label="Save profile changes"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </div>
  )
}
