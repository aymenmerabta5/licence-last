"use client"

import { ProfileSettingsTabForm } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/components/ProfileSettingsTabForm"
import type { ProfileSettingsTabProps } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/types"

export type { ProfileSettingsTabProps }

export function ProfileSettingsTab({
  me,
  studentProfile,
}: ProfileSettingsTabProps) {
  return <ProfileSettingsTabForm me={me} studentProfile={studentProfile} />
}
