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
    <div className="flex flex-col gap-4 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="w-full text-center text-xs font-medium text-muted-foreground/60 sm:w-auto sm:text-start">
        Unsaved changes will be lost if you leave this page.
      </p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="editorial-ghost"
          size="editorial-sm"
          onClick={onReset}
          disabled={isBusy}
          className="w-full sm:w-auto"
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
              className="w-full gap-2 sm:w-auto"
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
