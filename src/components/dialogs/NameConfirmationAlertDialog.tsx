"use client"

import { Loader2 } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NameConfirmationAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityName: string | null
  title: string
  description: string
  confirmationLabel: string
  confirmationPlaceholder: string
  cancelLabel: string
  confirmLabel: string
  confirmationId: string
  onConfirm: () => void
  isPending: boolean
  errorMessage?: string
}

export function NameConfirmationAlertDialog({
  open,
  onOpenChange,
  entityName,
  title,
  description,
  confirmationLabel,
  confirmationPlaceholder,
  cancelLabel,
  confirmLabel,
  confirmationId,
  onConfirm,
  isPending,
  errorMessage,
}: NameConfirmationAlertDialogProps) {
  const [confirmation, setConfirmation] = useState("")

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setConfirmation("")
    }
    onOpenChange(nextOpen)
  }

  const isNameMatch = confirmation.trim() === (entityName ?? "")

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label
            htmlFor={confirmationId}
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            {confirmationLabel}
          </Label>
          <Input
            id={confirmationId}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={confirmationPlaceholder}
            className="h-11 border-border/40"
            autoFocus
          />
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending || !isNameMatch || !entityName}
            onClick={onConfirm}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
