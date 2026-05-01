"use client"

import { useTranslations } from "next-intl"
import { ValidationListPage } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations"
import { useDeptHeadData } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/_components/DeptHeadValidationsView/hooks/useDeptHeadData"

export function DeptHeadValidationsView() {
  const t = useTranslations("dashboard.admin.deptValidations")
  const { applications, isLoading, isFetchingNextPage, sentinelRef } =
    useDeptHeadData()

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
      emptyLabel={t("empty")}
      detailHref={(applicationId) =>
        `/dashboard/dept-validations/${applicationId}`
      }
      listNamespace="dashboard.admin.deptValidations"
      maxWidthClass="max-w-5xl"
    />
  )
}
