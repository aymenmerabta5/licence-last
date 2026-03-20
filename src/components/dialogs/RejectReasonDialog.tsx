"use client"

import { Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RejectReasonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  reasonLabel: string
  reasonPlaceholder: string
  cancelLabel: string
  confirmLabel: string
  reasonId: string
  isPending: boolean
  onConfirm: (reason: string) => void
}

export function RejectReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  reasonLabel,
  reasonPlaceholder,
  cancelLabel,
  confirmLabel,
  reasonId,
  isPending,
  onConfirm,
}: RejectReasonDialogProps) {
  const [reason, setReason] = useState("")

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setReason("")
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label
              htmlFor={reasonId}
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              {reasonLabel}
            </Label>
            <Input
              id={reasonId}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={reasonPlaceholder}
              className="h-11 border-border/40"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !reason.trim()}
            onClick={() => {
              onConfirm(reason.trim())
              setReason("")
            }}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
