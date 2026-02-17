"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Briefcase, CheckCircle2, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

import type { StudentDashboardProps } from "./types"
import { WelcomeHero } from "./components/WelcomeHero"
import { ApplicationsFeed } from "./components/ApplicationsFeed"
import { RecommendedOffers } from "./components/RecommendedOffers"
import { SkillsSidebar } from "./components/SkillsSidebar"

export function StudentDashboard({ user, data }: StudentDashboardProps) {
  const t = useTranslations("dashboard.student")

  const stats = [
    {
      title: t("stats.applications"),
      value: String(data.stats.totalApplications),
      description: t("stats.pending", { count: data.stats.pendingApplications }),
      icon: Briefcase,
    },
    {
      title: t("stats.accepted"),
      value: String(data.stats.acceptedApplications),
      description: t("stats.acceptedDescription"),
      icon: CheckCircle2,
    },
    {
      title: t("skillsSection"),
      value: String(data.stats.skillsCount),
      description: data.stats.skillsCount >= 3
        ? t("stats.profileBoosted")
        : t("stats.addMoreSkills"),
      icon: Wrench,
    },
  ]

  const applicationsLabels = {
    title: t("applications.title"),
    viewAll: t("applications.viewAll"),
    emptyMessage: t("applications.emptyMessage"),
    exploreButton: t("applications.exploreButton"),
  }

  const offersLabels = {
    title: t("recentOffers"),
    exploreAll: t("offers.exploreAll"),
  }

  const skillsLabels = {
    title: t("skillsSection"),
    manageSkills: t("skills.manageSkills"),
    emptyMessage: t("skills.emptyMessage"),
    addSkills: t("skills.addSkills"),
  }

  return (
    <div className="space-y-10">
      <WelcomeHero
        userName={user.name}
        profileCompleteness={data.profileCompleteness}
        profileUserId={user.id}
      />

      {/* ── Editorial Stats Bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="grid grid-cols-1 sm:grid-cols-3 border-y-2 border-foreground dark:border-foreground/15"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className={cn(
                "py-7 px-6 text-center",
                i < stats.length - 1 &&
                  "border-b sm:border-b-0 sm:border-e border-border",
              )}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
                  {stat.title}
                </span>
              </div>
              <h3 className="font-serif text-4xl font-bold text-heading leading-none">
                {stat.value}
              </h3>
              <p className="text-[10px] text-muted-foreground/40 font-medium mt-2">
                {stat.description}
              </p>
            </div>
          )
        })}
      </motion.div>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <ApplicationsFeed
            applications={data.recentApplications}
            labels={applicationsLabels}
          />
          <RecommendedOffers
            offers={data.recommendedOffers}
            labels={offersLabels}
          />
        </div>

        <div className="lg:col-span-4">
          <SkillsSidebar
            skills={data.skills}
            labels={skillsLabels}
            profileUserId={user.id}
          />
        </div>
      </div>
    </div>
  )
}
