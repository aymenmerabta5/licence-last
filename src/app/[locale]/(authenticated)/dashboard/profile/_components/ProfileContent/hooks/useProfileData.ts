import { useMemo } from "react"

import { Briefcase, Award, ShieldCheck } from "lucide-react"

import type { ProfileUser, StudentData, ViewerIdentity } from "../types"

export function useProfileData(
  viewer: ViewerIdentity,
  user: ProfileUser,
  studentData?: StudentData,
) {
  const isOwner = viewer.id === user.id
  const canEdit = isOwner && user.role === "student"
  const isStudent: boolean = user.role === "student" && !!studentData
  const profile = studentData?.profile

  const stats = useMemo(() => {
    if (canEdit && isStudent && studentData?.stats) {
      return [
        {
          title: "Applications",
          value: String(studentData.stats.totalApplications),
          description: "Total submitted",
          icon: Briefcase,
        },
        {
          title: "Skills",
          value: String(studentData.stats.skillsCount),
          description: `${studentData.stats.skillsCount} skills added`,
          icon: Award,
        },
        {
          title: "Profile",
          value: `${studentData.stats.profileCompleteness}%`,
          description: studentData.stats.profileCompleteness === 100 ? "Complete!" : "Keep going",
          icon: ShieldCheck,
        },
      ]
    }

    return []
  }, [canEdit, isStudent, studentData])

  return {
    isStudent,
    isOwner,
    canEdit,
    profile,
    stats,
    university: studentData?.university,
    skills: studentData?.skills ?? [],
  }
}
