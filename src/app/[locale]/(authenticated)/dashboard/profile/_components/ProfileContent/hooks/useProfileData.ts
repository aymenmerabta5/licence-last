import { useMemo } from "react"

import type { ProfileUser, StudentData } from "../types"
import { Briefcase, Award, ShieldCheck } from "lucide-react"

export function useProfileData(user: ProfileUser, studentData?: StudentData) {
  const isStudent: boolean = user.role === "student" && !!studentData
  const profile = studentData?.profile

  const stats = useMemo(() => {
    if (isStudent && studentData) {
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

    return [
      {
        title: "Profile Views",
        value: "—",
        description: "Coming soon",
        icon: Briefcase,
      },
      {
        title: "Applications",
        value: "—",
        description: "Coming soon",
        icon: Briefcase,
      },
      {
        title: "Skill Score",
        value: "—",
        description: "Coming soon",
        icon: Award,
      },
    ]
  }, [isStudent, studentData])

  return {
    isStudent,
    profile,
    stats,
    university: studentData?.university,
    skills: studentData?.skills ?? [],
  }
}
