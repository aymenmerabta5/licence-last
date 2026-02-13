import type { orpcClient } from "@/server/orpc/client"

export type MeResult = Awaited<ReturnType<typeof orpcClient.users.getMe>>
export type StudentProfileResult = Awaited<
  ReturnType<typeof orpcClient.students.getProfile>
>

export interface ProfileSettingsTabProps {
  me: MeResult | undefined
  studentProfile: StudentProfileResult | null | undefined
  isLoading: boolean
}
