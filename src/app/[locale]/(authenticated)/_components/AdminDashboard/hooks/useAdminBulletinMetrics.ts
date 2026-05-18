"use client"

import type { AdminStats } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/hooks/useAdminDashboardData"
import {
  Briefcase,
  Building2,
  FileStack,
  GraduationCap,
  TrendingUp,
} from "lucide-react"
import { useTranslations } from "next-intl"
import type { DashboardMetric } from "@/app/[locale]/(authenticated)/_components/StatsBulletin"

export function useAdminBulletinMetrics(
  stats: AdminStats | undefined,
  isSuperAdmin: boolean,
): DashboardMetric[] {
  const t = useTranslations("dashboard.admin")

  if (!isSuperAdmin || !stats) return []

  return [
    {
      label: t("stats.totalStudents"),
      value: stats.totalStudents.toLocaleString(),
      sub: `${stats.placedStudents} placed`,
      icon: GraduationCap,
    },
    {
      label: t("stats.placementRate"),
      value: `${stats.placementRate}%`,
      sub: `${stats.totalStudents - stats.placedStudents} unplaced`,
      icon: TrendingUp,
      highlight: true,
    },
    {
      label: t("stats.totalCompanies"),
      value: stats.totalCompaniesApproved.toLocaleString(),
      sub: "Approved",
      icon: Building2,
    },
    {
      label: t("stats.totalOffers"),
      value: stats.totalOffersPublished.toLocaleString(),
      sub: "Published",
      icon: Briefcase,
    },
    {
      label: t("stats.totalPlacements"),
      value: stats.totalApplications.toLocaleString(),
      sub: t("stats.totalPlacements"),
      icon: FileStack,
    },
  ]
}
