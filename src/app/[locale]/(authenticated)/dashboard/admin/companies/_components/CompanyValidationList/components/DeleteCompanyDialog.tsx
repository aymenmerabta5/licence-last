"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import type { CompanyListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/types"
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

interface DeleteCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: CompanyListItem | null
  onConfirm: (companyId: string) => void
  isDeleting: boolean
}

export function DeleteCompanyDialog({
  open,
  onOpenChange,
  company,
  onConfirm,
  isDeleting,
}: DeleteCompanyDialogProps) {
  const t = useTranslations("dashboard.admin.companies.deleteDialog")
  const [confirmation, setConfirmation] = useState("")

  useEffect(() => {
    if (!open) {
      setConfirmation("")
    }
  }, [open])

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)
  }

  const isNameMatch = confirmation.trim() === (company?.name ?? "")

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-xl">
            {t("title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("description", { name: company?.name ?? "" })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label
            htmlFor="delete-company-confirmation"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            {t("confirmationLabel")}
          </Label>
          <Input
            id="delete-company-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={t("confirmationPlaceholder", {
              name: company?.name ?? "",
            })}
            className="h-11 border-border/40"
            autoFocus
          />
        </div>

        <AlertDialogFooter className="mt-4">
          <Button
            variant="editorial-outline"
            className="rounded-sm h-10"
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="editorial"
            className="bg-red-600 hover:bg-red-700 text-white border-transparent rounded-sm h-10"
            disabled={isDeleting || !isNameMatch || !company}
            onClick={() => company && onConfirm(company.id)}
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
