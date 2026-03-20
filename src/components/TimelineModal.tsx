"use client"

import { Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useLocale } from "next-intl"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface TimelineEvent {
  id: string
  eventType: string
  fromStage: string | null
  toStage: string | null
  createdAt: string | Date
}

interface TimelineModalProps {
  events: TimelineEvent[]
  isLoading: boolean
  onClose: () => void
}

export function TimelineModal({
  events,
  isLoading,
  onClose,
}: TimelineModalProps) {
  const locale = useLocale()

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent
        size="lg"
        className="space-y-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>Application Timeline</DialogTitle>
            <DialogDescription className="sr-only">
              Timeline of application stage updates and related events.
            </DialogDescription>
          </DialogHeader>

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading timeline...
            </div>
          )}

          {!isLoading && events.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No timeline events yet.
            </p>
          )}

          {events.map((event) => (
            <div key={event.id} className="border border-border p-3">
              <p className="text-xs font-medium text-foreground">
                {event.eventType.replace(/_/g, " ")}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {new Date(event.createdAt).toLocaleString(locale)}
              </p>
              {event.fromStage && event.toStage && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {event.fromStage}
                  {" -> "}
                  {event.toStage}
                </p>
              )}
            </div>
          ))}

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
