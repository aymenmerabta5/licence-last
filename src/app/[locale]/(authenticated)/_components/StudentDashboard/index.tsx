"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { DashboardMasthead } from "@/app/[locale]/(authenticated)/_components/DashboardMasthead"
import { StatsBulletin } from "@/app/[locale]/(authenticated)/_components/StatsBulletin"
import { ApplicationsFeed } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/ApplicationsFeed"
import { PendingInterviewCard } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/PendingInterviewCard"
import { RecommendedOffers } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/RecommendedOffers"
import { SkillsSidebar } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/SkillsSidebar"
import { useStudentDashboardContent } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/hooks/useStudentDashboardContent"
import type { StudentDashboardProps } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"
import type { Route } from "next"

export function StudentDashboard({ user, data }: StudentDashboardProps) {
  const { stats, applicationsLabels, offersLabels, skillsLabels } =
    useStudentDashboardContent(data.stats)

  const t = useTranslations("dashboard.student.welcomeHero")

  const firstName = user.name?.split(" ")[0]
  const displayName = firstName ?? t("defaultName")

  const bulletinMetrics = stats.map((stat, index) => ({
    label: stat.title,
    value: stat.value,
    sub: stat.description,
    icon: stat.icon,
    highlight: index === 0 && Number(stat.value) > 0,
  }))

  return (
    <div className="space-y-8 sm:space-y-12">
      <DashboardMasthead
        badge={<Badge variant="editorial-muted">{t("badge")}</Badge>}
        eyebrow={t("headlinePrefix")}
        title={
          <>
            {t("headlineAccent")}{" "}
            <span className="text-primary italic">{displayName}.</span>
          </>
        }
        description={
          data.profileCompleteness < 100
            ? t("profileIncomplete")
            : t("profileComplete")
        }
        rightSlot={
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {t("profileStrength")}
              </span>
              <span className="font-serif text-lg text-heading tabular-nums">
                {data.profileCompleteness}
                <span className="text-xs text-primary">%</span>
              </span>
            </div>
            <div className="h-1 w-32 bg-border/30 overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${data.profileCompleteness}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease }}
              />
            </div>
          </div>
        }
        actions={
          <>
            {data.profileCompleteness < 100 && (
              <Button
                nativeButton={false}
                render={
                  <Link
                    href={`/profile/${user.id}` as Route}
                    prefetch={false}
                  >
                    {t("completeProfile")}
                  </Link>
                }
                variant="editorial"
                size="editorial"
              />
            )}
            <Button
              nativeButton={false}
              render={
                <Link href="/dashboard/explore" prefetch={false}>
                  {t("exploreInternships")}
                </Link>
              }
              variant="editorial-outline"
              size="editorial"
            />
          </>
        }
      />

      <StatsBulletin metrics={bulletinMetrics} />

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
