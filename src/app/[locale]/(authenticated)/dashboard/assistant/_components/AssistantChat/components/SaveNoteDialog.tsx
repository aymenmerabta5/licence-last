"use client"

import { NotebookPen } from "lucide-react"
import { useTranslations } from "next-intl"
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
import { Textarea } from "@/components/ui/textarea"

interface SaveNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (note: string) => Promise<void>
  isSaving?: boolean
}

export function SaveNoteDialog({
  open,
  onOpenChange,
  onSave,
  isSaving = false,
}: SaveNoteDialogProps) {
  const t = useTranslations("dashboard.assistant")
  const [note, setNote] = useState("")

  const handleOpenChange = (next: boolean) => {
    if (!next) setNote("")
    onOpenChange(next)
  }

  const handleSave = async () => {
    const trimmed = note.trim()
    if (!trimmed || isSaving) return
    await onSave(trimmed)
    setNote("")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-none sm:max-w-[480px] gap-0 p-0 overflow-hidden">
        {/* Header band */}
        <div className="bg-primary/8 border-b border-border/60 px-6 py-5">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 bg-primary/10 rounded-none">
                <NotebookPen className="h-3.5 w-3.5 text-primary" />
              </div>
              <DialogTitle className="text-base font-serif">
                {t("noteDialogTitle")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-2 ms-9">
              {t("noteDialogDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <Textarea
            placeholder={t("notePlaceholder")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[130px] resize-none rounded-none border-border/60 focus-visible:ring-primary/30 text-sm leading-relaxed"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                void handleSave()
              }
            }}
          />
          <p className="mt-2 text-[10px] text-muted-foreground/60 text-end">
            ⌘↵ to save
          </p>
        </div>

        <DialogFooter className="px-6 pb-5 gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-none"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            {t("noteCancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-none gap-2"
            onClick={() => void handleSave()}
            disabled={!note.trim() || isSaving}
          >
            <NotebookPen className="h-3.5 w-3.5" />
            {isSaving ? t("noteSaving") : t("saveNote")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
