"use client"

import { useLocale } from "next-intl"
import * as motion from "motion/react-client"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface TimelineEvent {
  id: string
  eventType: string
  fromStage: string | null
  toStage: string | null
  createdAt: string
}

interface TimelineModalProps {
  events: TimelineEvent[]
  isLoading: boolean
  onClose: () => void
}

export function TimelineModal({ events, isLoading, onClose }: TimelineModalProps) {
  const locale = useLocale()

  return (
    <div className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border p-6 max-w-lg w-full space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-serif text-lg text-heading">Application Timeline</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading timeline...
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <p className="text-sm text-muted-foreground">No timeline events yet.</p>
        )}

        {events.map((event) => (
          <div key={event.id} className="border border-border p-3">
            <p className="text-xs font-medium text-foreground">
              {event.eventType.replace(/_/g, " ")}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {new Date(event.createdAt).toLocaleString(locale)}
            </p>
            {event.fromStage && event.toStage && (
              <p className="text-[11px] text-muted-foreground mt-1">
                {event.fromStage}
                {" -> "}
                {event.toStage}
              </p>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
