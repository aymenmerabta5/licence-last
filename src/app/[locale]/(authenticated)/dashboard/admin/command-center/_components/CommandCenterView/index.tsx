"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ArrowLeft } from "lucide-react"

import { Link } from "@/i18n/routing"
import { reveal, ease } from "@/lib/animations"

import { useCommandCenterData } from "./hooks/useCommandCenterData"
import { PlatformHealthCards } from "./components/PlatformHealthCards"
import { QuickActionsGrid } from "./components/QuickActionsGrid"
import { RecentActivityFeed } from "./components/RecentActivityFeed"

export function CommandCenterView() {
  const t = useTranslations("dashboard.superAdmin.commandCenter")
  const { totalUsers, bannedUsers, recentUsers, isLoading } = useCommandCenterData()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <Link
          href={"/dashboard" as const}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("backToDashboard")}
        </Link>

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
            {t("kicker")}
          </p>
          <h1 className="font-serif text-3xl text-heading tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            {t("description")}
          </p>
        </div>
      </motion.div>

      <PlatformHealthCards
        totalUsers={totalUsers}
        bannedUsers={bannedUsers}
        isLoading={isLoading}
      />

      <QuickActionsGrid />

      <RecentActivityFeed recentUsers={recentUsers} isLoading={isLoading} />
    </div>
  )
}
