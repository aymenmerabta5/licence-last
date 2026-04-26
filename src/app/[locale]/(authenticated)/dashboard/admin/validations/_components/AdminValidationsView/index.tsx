"use client"

import { useTranslations } from "next-intl"
import { ValidationListPage } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations"
import { useAdminValidations } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/_components/AdminValidationsView/hooks/useAdminValidations"

export function AdminValidationsView() {
  const t = useTranslations("dashboard.admin.validations")
  const { applications, isLoading, isFetchingNextPage, sentinelRef } =
    useAdminValidations()

  return (
    <ValidationListPage
      applications={applications}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      sentinelRef={sentinelRef}
      backHref="/dashboard"
      backLabel={t("backToDashboard")}
      title={t("title")}
      description={t("description")}
      kicker="Validation Center"
      emptyLabel={t("empty")}
      detailHref={(applicationId) =>
        `/dashboard/admin/validations/${applicationId}`
      }
      listNamespace="dashboard.admin.validations"
    />
  )
}
