"use client"

import { AlertTriangle } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { NameConfirmationAlertDialog } from "@/components/dialogs/NameConfirmationAlertDialog"
import { Button } from "@/components/ui/button"
import { ease } from "@/lib/animations"

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
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay: 0.45 }}
      className="border border-destructive/20 dark:border-destructive/15 overflow-hidden"
    >
      {/* Danger accent line */}
      <div className="h-0.5 bg-destructive/40" />

      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="font-serif text-lg tracking-tight text-heading">
              {t("title")}
            </h3>
            <p className="text-sm font-light text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>

        <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
          {t("openDialog")}
        </Button>
      </div>

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
    </motion.section>
  )
}
