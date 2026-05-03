"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InterviewProposalModalFooterProps {
  cancelLabel: string
  submitLabel: string
  isSubmitting: boolean
  onClose: () => void
  onSubmit: () => void
}

export function InterviewProposalModalFooter({
  cancelLabel,
  submitLabel,
  isSubmitting,
  onClose,
  onSubmit,
}: InterviewProposalModalFooterProps) {
  return (
    <div className="flex gap-2 justify-end p-6 border-t border-border/50">
      <Button
        variant="editorial-outline"
        size="editorial-sm"
        onClick={onClose}
        disabled={isSubmitting}
        className="rounded-none"
      >
        {cancelLabel}
      </Button>
      <Button
        size="sm"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="font-bold uppercase tracking-wider text-[11px] rounded-none"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  )
}
