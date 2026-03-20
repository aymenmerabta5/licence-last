"use client"

import { AlertTriangle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { NameConfirmationAlertDialog } from "@/components/dialogs/NameConfirmationAlertDialog"
import { Button } from "@/components/ui/button"

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

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
  }

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

      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        {t("openDialog")}
      </Button>

      <NameConfirmationAlertDialog
        open={open}
        onOpenChange={handleOpenChange}
        entityName={companyName}
        title={t("dialogTitle")}
        description={t("dialogDescription", { name: companyName })}
        confirmationLabel={t("confirmationLabel")}
        confirmationPlaceholder={t("confirmationPlaceholder", {
          name: companyName,
        })}
        cancelLabel={t("cancel")}
        confirmLabel={t("confirm")}
        confirmationId="delete-company-self-confirmation"
        isPending={isDeleting}
        errorMessage={errorMessage}
        onConfirm={() => {
          void onConfirmDelete()
        }}
      />
    </section>
  )
}
