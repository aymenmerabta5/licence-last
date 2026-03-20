import { useTranslations } from "next-intl"
import type { CompanyListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/companies/_components/CompanyValidationList/types"
import { NameConfirmationAlertDialog } from "@/components/dialogs/NameConfirmationAlertDialog"

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

  return (
    <NameConfirmationAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      entityName={company?.name ?? null}
      title={t("title")}
      description={t("description", { name: company?.name ?? "" })}
      confirmationLabel={t("confirmationLabel")}
      confirmationPlaceholder={t("confirmationPlaceholder", {
        name: company?.name ?? "",
      })}
      cancelLabel={t("cancel")}
      confirmLabel={t("confirm")}
      confirmationId="delete-company-confirmation"
      isPending={isDeleting}
      onConfirm={() => {
        if (company) {
          onConfirm(company.id)
        }
      }}
    />
  )
}
