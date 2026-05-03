"use client"

import { CalendarPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InterviewProposalModalHeaderProps {
  studentName: string
  offerTitle: string
  closeAriaLabel: string
  isSubmitting: boolean
  onClose: () => void
}

export function InterviewProposalModalHeader({
  studentName,
  offerTitle,
  closeAriaLabel,
  isSubmitting,
  onClose,
}: InterviewProposalModalHeaderProps) {
  return (
    <div className="flex items-start justify-between p-6 border-b border-border/50">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-primary/10 shrink-0">
          <CalendarPlus className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-serif text-lg text-heading tracking-tight">
            Propose Interview
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {studentName} — {offerTitle}
          </p>
        </div>
      </div>
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        onClick={onClose}
        disabled={isSubmitting}
        aria-label={closeAriaLabel}
        className="rounded-none"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
