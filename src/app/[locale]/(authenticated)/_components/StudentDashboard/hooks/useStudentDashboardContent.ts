"use client"

import { Briefcase, CheckCircle2, Clock3, Heart, Wrench } from "lucide-react"
import { useTranslations } from "next-intl"

import type {
  StudentDashboardApplicationsLabels,
  StudentDashboardOffersLabels,
  StudentDashboardSkillsLabels,
  StudentDashboardStat,
  StudentDashboardStats,
} from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"

interface UseStudentDashboardContentResult {
  stats: StudentDashboardStat[]
  applicationsLabels: StudentDashboardApplicationsLabels
  offersLabels: StudentDashboardOffersLabels
  skillsLabels: StudentDashboardSkillsLabels
}

export function useStudentDashboardContent(
  statsData: StudentDashboardStats,
): UseStudentDashboardContentResult {
  const t = useTranslations("dashboard.student")

  const stats: StudentDashboardStat[] = [
    {
      title: t("stats.applications"),
      value: String(statsData.totalApplications),
      description: t("stats.pending", { count: statsData.pendingApplications }),
      icon: Briefcase,
    },
    {
      title: t("stats.accepted"),
      value: String(statsData.acceptedApplications),
      description: t("stats.acceptedDescription"),
      icon: CheckCircle2,
    },
    {
      title: t("skillsSection"),
      value: String(statsData.skillsCount),
      description:
        statsData.skillsCount >= 3
          ? t("stats.profileBoosted")
          : t("stats.addMoreSkills"),
      icon: Wrench,
    },
    {
      title: t("stats.savedOffers"),
      value: String(statsData.savedOffersCount),
      description: t("offers.exploreAll"),
      icon: Heart,
    },
    {
      title: t("stats.interviews"),
      value: String(statsData.interviewsCount),
      description: t("stats.acceptedDescription"),
      icon: Clock3,
    },
  ]

  const applicationsLabels: StudentDashboardApplicationsLabels = {
    title: t("applications.title"),
    viewAll: t("applications.viewAll"),
    emptyMessage: t("applications.emptyMessage"),
    exploreButton: t("applications.exploreButton"),
  }

  const offersLabels: StudentDashboardOffersLabels = {
    title: t("recentOffers"),
    exploreAll: t("offers.exploreAll"),
  }

  const skillsLabels: StudentDashboardSkillsLabels = {
    title: t("skillsSection"),
    manageSkills: t("skills.manageSkills"),
    emptyMessage: t("skills.emptyMessage"),
    addSkills: t("skills.addSkills"),
  }

  return {
    stats,
    applicationsLabels,
    offersLabels,
    skillsLabels,
  }
}
