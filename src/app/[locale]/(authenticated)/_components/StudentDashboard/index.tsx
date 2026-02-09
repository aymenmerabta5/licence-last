"use client"

import { useTranslations } from "next-intl"
import { Briefcase, CheckCircle2, Wrench } from "lucide-react"

import type { StudentDashboardProps } from "./types"
import { WelcomeHero } from "./components/WelcomeHero"
import { ApplicationsFeed } from "./components/ApplicationsFeed"
import { RecommendedOffers } from "./components/RecommendedOffers"
import { SkillsSidebar } from "./components/SkillsSidebar"
import { StatsCard } from "../StatsCard"

export function StudentDashboard({ user, data }: StudentDashboardProps) {
  const t = useTranslations("dashboard.student")

  const stats = [
    {
      title: t("stats.applications"),
      value: String(data.stats.totalApplications),
      description: `${data.stats.pendingApplications} pending`,
      icon: Briefcase,
    },
    {
      title: "Accepted",
      value: String(data.stats.acceptedApplications),
      description: "Accepted applications",
      icon: CheckCircle2,
    },
    {
      title: t("skillsSection"),
      value: String(data.stats.skillsCount),
      description: `${data.stats.skillsCount >= 3 ? "Profile boosted" : "Add more skills"}`,
      icon: Wrench,
    },
  ]

  const applicationsLabels = {
    title: "Recent Applications",
    viewAll: "View All",
    emptyMessage: "You haven't applied to any internships yet. Start exploring opportunities!",
    exploreButton: "Explore Internships",
  }

  const offersLabels = {
    title: t("recentOffers"),
    exploreAll: "Explore All",
  }

  const skillsLabels = {
    title: t("skillsSection"),
    manageSkills: "Manage Skills",
    emptyMessage: "Add your technical skills to stand out to recruiters",
    addSkills: "Add Skills",
  }

  return (
    <div className="space-y-8">
      <WelcomeHero
        userName={user.name}
        profileCompleteness={data.profileCompleteness}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} index={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <ApplicationsFeed
            applications={data.recentApplications}
            labels={applicationsLabels}
          />
          <RecommendedOffers
            offers={data.recommendedOffers}
            labels={offersLabels}
          />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <SkillsSidebar
            skills={data.skills}
            labels={skillsLabels}
          />
        </div>
      </div>
    </div>
  )
}
