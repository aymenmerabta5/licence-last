import type { useDeptHeadPlacementActions } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/hooks/useDeptHeadPlacementActions"
import type { useDeptHeadPlacementData } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/hooks/useDeptHeadPlacementData"

export type DeptHeadPlacementApplication = NonNullable<
  ReturnType<typeof useDeptHeadPlacementData>["application"]
>

export type DeptHeadPlacementActions = ReturnType<typeof useDeptHeadPlacementActions>
