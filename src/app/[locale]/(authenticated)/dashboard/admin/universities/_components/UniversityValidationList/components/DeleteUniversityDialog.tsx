import { useTranslations } from "next-intl"
import type { UniversityListItem } from "@/app/[locale]/(authenticated)/dashboard/admin/universities/_components/UniversityValidationList/types"
import { NameConfirmationAlertDialog } from "@/components/dialogs/NameConfirmationAlertDialog"

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

  return (
    <NameConfirmationAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      entityName={university?.name ?? null}
      title={t("title")}
      description={t("description", { name: university?.name ?? "" })}
      confirmationLabel={t("confirmationLabel")}
      confirmationPlaceholder={t("confirmationPlaceholder", {
        name: university?.name ?? "",
      })}
      cancelLabel={t("cancel")}
      confirmLabel={t("confirm")}
      confirmationId="delete-university-confirmation"
      isPending={isDeleting}
      onConfirm={() => {
        if (university) {
          onConfirm(university.id)
        }
      }}
    />
  )
}
