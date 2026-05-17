"use client"

import { CalendarPlus, Loader2, Send } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ease, reveal } from "@/lib/animations"

interface RescheduleRequestFormProps {
  interviewId: string
  onSubmit: (input: {
    interviewId: string
    reason?: string
    proposedSlots: Array<{ startsAt: string; endsAt: string }>
  }) => Promise<void>
  isSubmitting: boolean
}

export function RescheduleRequestForm({
  interviewId,
  onSubmit,
  isSubmitting,
}: RescheduleRequestFormProps) {
  const t = useTranslations("dashboard.interviews.detail")
  const [reason, setReason] = useState("")
  const [slots, setSlots] = useState([
    { id: "1", startsAt: "", endsAt: "" },
  ])

  const addSlot = () => {
    if (slots.length >= 3) return
    setSlots((prev) => [...prev, { id: crypto.randomUUID(), startsAt: "", endsAt: "" }])
  }

  const removeSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId))
  }

  const updateSlot = (slotId: string, field: "startsAt" | "endsAt", value: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, [field]: value } : s)),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validSlots = slots
      .filter((s) => s.startsAt && s.endsAt)
      .map((s) => ({ startsAt: s.startsAt, endsAt: s.endsAt }))
    if (validSlots.length === 0) return
    void onSubmit({
      interviewId,
      reason: reason.trim() || undefined,
      proposedSlots: validSlots,
    })
  }

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.4, ease }}
      className="space-y-4 border border-border/60 bg-card/50 p-4"
    >
      <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
        {t("rescheduleTitle")}
      </h2>
      <p className="text-xs text-muted-foreground">{t("rescheduleDescription")}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {slots.map((slot, index) => (
            <div key={slot.id} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">
                  {t("slots.startsAt")} {index + 1}
                </Label>
                <Input
                  type="datetime-local"
                  value={slot.startsAt}
                  onChange={(e) => updateSlot(slot.id, "startsAt", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">
                  {t("slots.endsAt")} {index + 1}
                </Label>
                <Input
                  type="datetime-local"
                  value={slot.endsAt}
                  onChange={(e) => updateSlot(slot.id, "endsAt", e.target.value)}
                  required
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {slots.length < 3 && (
            <Button
              type="button"
              variant="editorial-ghost"
              size="sm"
              onClick={addSlot}
              className="gap-1.5 text-xs"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              {t("addSlot")}
            </Button>
          )}
          {slots.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeSlot(slots[slots.length - 1].id)}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              {t("removeLastSlot")}
            </Button>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">
            {t("rescheduleReason")}
          </Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("rescheduleReasonPlaceholder")}
            rows={2}
            className="resize-none text-sm"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="editorial"
            size="sm"
            disabled={isSubmitting || slots.some((s) => !s.startsAt || !s.endsAt)}
            className="gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
            {isSubmitting ? t("rescheduleSubmitting") : t("rescheduleSubmit")}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
