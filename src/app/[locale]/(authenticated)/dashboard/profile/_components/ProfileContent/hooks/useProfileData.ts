import { Award, Briefcase, ShieldCheck } from "lucide-react"
import { useMemo } from "react"

import type {
  ProfileUser,
  StudentData,
  ViewerIdentity,
} from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"

interface TranslationValues {
  [key: string]: string | number | Date
}

export function useProfileData(
  viewer: ViewerIdentity,
  user: ProfileUser,
  t: (key: string, values?: TranslationValues) => string,
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
          title: t("student.profile.stats.applications"),
          value: String(studentData.stats.totalApplications),
          description: t("student.profile.stats.totalSubmitted"),
          icon: Briefcase,
        },
        {
          title: t("student.profile.stats.skills"),
          value: String(studentData.stats.skillsCount),
          description: t("student.profile.stats.skillsAdded", {
            count: studentData.stats.skillsCount,
          }),
          icon: Award,
        },
        {
          title: t("student.profile.stats.profile"),
          value: `${studentData.stats.profileCompleteness}%`,
          description:
            studentData.stats.profileCompleteness === 100
              ? t("student.profile.stats.complete")
              : t("student.profile.stats.keepGoing"),
          icon: ShieldCheck,
        },
      ]
    }

    return []
  }, [canEdit, isStudent, studentData, t])

  return {
    isStudent,
    isOwner,
    canEdit,
    profile,
    stats,
    university: studentData?.university,
    skills: studentData?.skills ?? [],
    experiences: studentData?.experiences ?? [],
  }
}
