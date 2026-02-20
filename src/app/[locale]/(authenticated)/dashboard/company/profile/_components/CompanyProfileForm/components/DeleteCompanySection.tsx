"use client"

import { AlertTriangle, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
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

interface DeleteCompanySectionProps {
  companyName: string
  onConfirmDelete: () => Promise<void>
  isDeleting: boolean
  errorMessage: string
}

export function DeleteCompanySection({
  companyName,
  onConfirmDelete,
  isDeleting,
  errorMessage,
}: DeleteCompanySectionProps) {
  const t = useTranslations("dashboard.company.profile.deleteCompany")
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setConfirmation("")
    }
    setOpen(nextOpen)
  }

  const isNameMatch = confirmation.trim() === companyName

  return (
    <section className="rounded-xl border border-red-300/40 bg-red-50/40 dark:bg-red-950/15 dark:border-red-900/40 p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 p-2">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="space-y-1">
          <h3 className="font-serif text-xl tracking-tight text-heading">
            {t("title")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      <Button
        type="button"
        variant="editorial"
        className="bg-red-600 hover:bg-red-700 text-white border-transparent"
        onClick={() => setOpen(true)}
      >
        {t("openDialog")}
      </Button>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">
              {t("dialogTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialogDescription", { name: companyName })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label
              htmlFor="delete-company-self-confirmation"
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              {t("confirmationLabel")}
            </Label>
            <Input
              id="delete-company-self-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={t("confirmationPlaceholder", { name: companyName })}
              className="h-11 border-border/40"
              autoFocus
            />
            {errorMessage ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <AlertDialogFooter className="mt-4">
            <Button
              type="button"
              variant="editorial-outline"
              className="rounded-sm h-10"
              onClick={() => handleOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="editorial"
              className="bg-red-600 hover:bg-red-700 text-white border-transparent rounded-sm h-10"
              disabled={isDeleting || !isNameMatch}
              onClick={() => {
                void onConfirmDelete()
              }}
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
    </section>
  )
}
