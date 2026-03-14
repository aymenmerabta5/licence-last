"use client"

import { Pencil } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
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

interface RenameConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTitle: string
  onSave: (title: string | null) => void
}

export function RenameConversationDialog({
  open,
  onOpenChange,
  currentTitle,
  onSave,
}: RenameConversationDialogProps) {
  const t = useTranslations("dashboard.assistant")
  const [value, setValue] = useState(currentTitle)

  // Sync input when dialog opens with a fresh title
  useEffect(() => {
    if (open) setValue(currentTitle)
  }, [open, currentTitle])

  const handleSave = () => {
    const trimmed = value.trim()
    onSave(trimmed.length > 0 ? trimmed : null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none sm:max-w-[420px] gap-0 p-0 overflow-hidden">
        {/* Header band */}
        <div className="bg-primary/8 border-b border-border/60 px-6 py-5">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 bg-primary/10 rounded-none">
                <Pencil className="h-3.5 w-3.5 text-primary" />
              </div>
              <DialogTitle className="text-base font-serif">
                {t("renameDialogTitle")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-2 ms-9">
              {t("renameDialogDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t("renamePlaceholder")}
            className="rounded-none border-border/60 focus-visible:ring-primary/30"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") onOpenChange(false)
            }}
          />
        </div>

        <DialogFooter className="px-6 pb-5 gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-none"
            onClick={() => onOpenChange(false)}
          >
            {t("renameCancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-none gap-2"
            onClick={handleSave}
          >
            <Pencil className="h-3.5 w-3.5" />
            {t("renameSave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
