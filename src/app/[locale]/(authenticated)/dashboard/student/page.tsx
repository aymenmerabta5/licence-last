import { redirect } from "next/navigation"

import { getTranslations } from "next-intl/server"

import { requireRole } from "@/lib/auth-guards"
import { StudentDashboard } from "@/app/[locale]/(authenticated)/_components/StudentDashboard"
import { getStudentDashboardStats } from "@/server/services/students/get-dashboard-stats"
import { getStudentProfile } from "@/server/services/students/get-profile"
import { listApplicationsByStudent } from "@/server/services/applications/list-by-student"
import { searchOffers } from "@/server/services/offers/search"
import { calculateProfileCompleteness } from "@/lib/profile-completeness"

type Params = Promise<{ locale: string }>

export default async function StudentDashboardPage({
  params,
}: {
  params: Params
}) {
  const [{ locale }, user] = await Promise.all([params, requireRole(["student"])])

  if (!user.onboardingCompleted) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirect(`/${locale}/onboarding/student` as any)
  }

  const t = await getTranslations("dashboard")
  const greeting = t("welcome")

  const [stats, recentAppsResult, profile, recommendedResult] = await Promise.all([
    getStudentDashboardStats(user.id),
    listApplicationsByStudent(user.id, { limit: 5 }),
    getStudentProfile(user.id),
    searchOffers({ limit: 3 }),
  ])

  const profileCompleteness = calculateProfileCompleteness({
    bio: profile?.profile.bio,
    phone: profile?.profile.phone,
    wilayaCode: profile?.profile.wilayaCode,
    githubUrl: profile?.profile.githubUrl,
    portfolioUrl: profile?.profile.portfolioUrl,
    studentNumber: profile?.profile.studentNumber,
    department: profile?.profile.department,
    skillsCount: profile?.skills.length ?? 0,
  })

  const studentData = {
    stats,
    recentApplications: recentAppsResult.applications.map((app) => ({
      ...app,
      createdAt: app.createdAt.toISOString(),
    })),
    recommendedOffers: recommendedResult.offers.map((offer) => ({
      ...offer,
      closesAt: offer.closesAt?.toISOString() ?? null,
      createdAt: offer.createdAt.toISOString(),
    })),
    skills: profile?.skills ?? [],
    profileCompleteness,
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header className="space-y-2">
        <h1 className="font-serif text-[clamp(2.5rem,5vw,3.5rem)] leading-none tracking-tight text-heading">
          {greeting}{" "}
          <span className="text-primary">
            {user.name?.split(" ")[0] || "User"}
          </span>
        </h1>
        <p className="text-muted-foreground text-sm font-light tracking-wide max-w-2xl">
          Your next career milestone is just a few clicks away. Explore new
          opportunities tailored to your skills.
        </p>
      </header>

      <StudentDashboard user={user} data={studentData} />
    </div>
  )
}
