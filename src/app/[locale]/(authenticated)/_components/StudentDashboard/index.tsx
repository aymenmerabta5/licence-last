"use client"

import { ApplicationsFeed } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/ApplicationsFeed"
import { EditorialStatsBar } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/EditorialStatsBar"
import { PendingInterviewCard } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/PendingInterviewCard"
import { RecommendedOffers } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/RecommendedOffers"
import { SkillsSidebar } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/SkillsSidebar"
import { WelcomeHero } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/WelcomeHero"
import { useStudentDashboardContent } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/hooks/useStudentDashboardContent"
import type { StudentDashboardProps } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"

export function StudentDashboard({ user, data }: StudentDashboardProps) {
  const { stats, applicationsLabels, offersLabels, skillsLabels } =
    useStudentDashboardContent(data.stats)

  return (
    <div className="space-y-10">
      <WelcomeHero
        userName={user.name}
        profileCompleteness={data.profileCompleteness}
        profileUserId={user.id}
      />

      <EditorialStatsBar stats={stats} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-8">
          {data.pendingInterview && (
            <PendingInterviewCard interview={data.pendingInterview} />
          )}
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
