"use client"

import { ProfileSettingsTabForm } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/components/ProfileSettingsTabForm"
import { ProfileSettingsTabSkeleton } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/components/ProfileSettingsTabSkeleton"
import type { ProfileSettingsTabProps } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/types"

export type { ProfileSettingsTabProps }

export function ProfileSettingsTab({
  me,
  studentProfile,
  isLoading,
}: ProfileSettingsTabProps) {
  if (isLoading || !me) {
    return <ProfileSettingsTabSkeleton />
  }

  return (
    <ProfileSettingsTabForm me={me} studentProfile={studentProfile ?? null} />
  )
}
