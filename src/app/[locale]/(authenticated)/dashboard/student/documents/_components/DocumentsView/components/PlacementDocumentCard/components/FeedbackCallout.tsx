import { MessageSquarePlus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface FeedbackCalloutProps {
  description: string
  actionLabel: string
  onOpenFeedback: () => void
}

export function FeedbackCallout({
  description,
  actionLabel,
  onOpenFeedback,
}: FeedbackCalloutProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{description}</p>
      <Button
        type="button"
        variant="editorial-outline"
        size="sm"
        className="gap-1.5"
        onClick={onOpenFeedback}
      >
        <MessageSquarePlus className="h-3.5 w-3.5" />
        {actionLabel}
      </Button>
    </div>
  )
}
