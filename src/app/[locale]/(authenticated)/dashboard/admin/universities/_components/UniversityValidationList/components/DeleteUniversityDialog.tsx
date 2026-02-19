"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import type { UniversityListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/types"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DeleteUniversityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  university: UniversityListItem | null
  onConfirm: (universityId: string) => void
  isDeleting: boolean
}

export function DeleteUniversityDialog({
  open,
  onOpenChange,
  university,
  onConfirm,
  isDeleting,
}: DeleteUniversityDialogProps) {
  const t = useTranslations("dashboard.admin.universities.deleteDialog")
  const [confirmation, setConfirmation] = useState("")

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setConfirmation("")
    }
    onOpenChange(nextOpen)
  }

  const isNameMatch = confirmation.trim() === (university?.name ?? "")

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-xl">
            {t("title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("description", { name: university?.name ?? "" })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label
            htmlFor="delete-university-confirmation"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            {t("confirmationLabel")}
          </Label>
          <Input
            id="delete-university-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={t("confirmationPlaceholder", {
              name: university?.name ?? "",
            })}
            className="h-11 border-border/40"
            autoFocus
          />
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={isDeleting || !isNameMatch || !university}
            onClick={() => university && onConfirm(university.id)}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("confirm")
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
