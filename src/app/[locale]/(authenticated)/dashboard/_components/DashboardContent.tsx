import { getTranslations } from "next-intl/server"
import { Suspense } from "react"
import type { StudentDashboardData } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"
import { requireDashboardUser } from "@/lib/dashboard-access"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { localeRedirect } from "@/lib/navigation"
import { calculateProfileCompleteness } from "@/lib/profile-completeness"
import { listApplicationsByStudent } from "@/server/services/applications/list-by-student"
import { recommendOffersForStudent } from "@/server/services/offers/recommend"
import { getStudentDashboardStats } from "@/server/services/students/get-dashboard-stats"
import { getStudentProfile } from "@/server/services/students/get-profile"

interface DashboardContentProps {
  studentFallback: React.ReactNode
  studentComponent: React.ComponentType<{
    user: {
      id: string
      name: string | null
      email: string
      role: string | null | undefined
    }
    data: StudentDashboardData
  }>
  recruiterComponent: React.ComponentType<{
    user: { id: string; name: string | null; email: string; role: string }
    assistantEnabled: boolean
  }>
  adminComponent: React.ComponentType<{
    user: { id: string; name: string | null; email: string; role: string }
  }>
  deptHeadComponent: React.ComponentType<{
    user: { id: string; name: string | null; email: string; role: string }
  }>
}

async function StudentDashboardContent({
  user,
  component: Component,
}: {
  user: { id: string; name: string | null; email: string; role: string }
  component: React.ComponentType<{
    user: {
      id: string
      name: string | null
      email: string
      role: string | null | undefined
    }
    data: StudentDashboardData
  }>
}) {
  const [stats, recentAppsResult, profile, recommendedResult] =
    await Promise.all([
      getStudentDashboardStats(user.id),
      listApplicationsByStudent(user.id, { limit: 5 }),
      getStudentProfile(user.id),
      recommendOffersForStudent({ studentUserId: user.id, limit: 3 }),
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

  const studentData: StudentDashboardData = {
    stats: {
      totalApplications: stats.totalApplications,
      pendingApplications: stats.pendingApplications,
      acceptedApplications: stats.acceptedApplications,
      skillsCount: stats.skillsCount,
      savedOffersCount: stats.savedOffersCount,
      interviewsCount: stats.interviewsCount,
    },
    recentApplications: recentAppsResult.applications.map((app) => ({
      id: app.id,
      status: app.status,
      createdAt: app.createdAt.toISOString(),
      offerTitle: app.offerTitle,
      companyName: app.companyName,
      companyLogoUrl: app.companyLogoUrl,
      offerInternshipType: app.offerInternshipType,
      offerWorkMode: app.offerWorkMode,
      offerWilayaCode: app.offerWilayaCode,
    })),
    recommendedOffers: recommendedResult.offers.map((offer) => ({
      id: offer.id,
      title: offer.title,
      companyName: offer.companyName,
      companyLogoUrl: offer.companyLogoUrl,
      internshipType: offer.internshipType,
      workMode: offer.workMode,
      wilayaCode: offer.companyWilayaCode,
      createdAt: offer.createdAt.toISOString(),
      skills: offer.skills,
    })),
    skills: profile?.skills ?? [],
    profileCompleteness,
  }

  return <Component user={user} data={studentData} />
}

/**
 * Dashboard content component that handles auth and data fetching.
 * Separated to support Next.js 16 cacheComponents with Suspense boundary.
 */
export async function DashboardContent({
  studentFallback,
  studentComponent,
  recruiterComponent: RecruiterDashboard,
  adminComponent: AdminDashboard,
  deptHeadComponent: DeptHeadDashboard,
}: DashboardContentProps) {
  const [user, t] = await Promise.all([
    requireDashboardUser(),
    getTranslations("dashboard"),
  ])

  const effectiveRole = user.effectiveRole ?? user.role ?? "student"
  const isDeptHead =
    effectiveRole === "university_admin" &&
    user.universityMembershipRole === "department_head"

  // Redirects for incomplete onboarding
  if (effectiveRole === "student" && !user.onboardingCompleted) {
    return localeRedirect("/onboarding/student")
  }

  const greeting = t("welcome")

  const roleSubtitleKey = {
    student: "student.subtitle",
    company_admin: "recruiter.subtitle",
    university_admin: isDeptHead
      ? "deptHeadDashboard.subtitle"
      : "admin.subtitle",
    super_admin: "admin.subtitle",
  } as const

  const subtitle = t(
    roleSubtitleKey[effectiveRole as keyof typeof roleSubtitleKey] ||
      "student.subtitle",
  )
  const assistantEnabled = isFeatureEnabled("COMPANY_ASSISTANT")

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* ── Page Header (static, no data fetching) ── */}
      <header className="space-y-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
          {t(
            `roles.${
              effectiveRole === "company_admin"
                ? "recruiter"
                : effectiveRole === "super_admin"
                  ? "university_admin"
                  : isDeptHead
                    ? "department_head"
                    : effectiveRole
            }`,
          )}{" "}
          Dashboard
        </p>
        <h1 className="font-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-none tracking-tight text-heading">
          {greeting}{" "}
          <span className="text-primary">
            {user.name?.split(" ")[0] || "User"}
          </span>
        </h1>
        <p className="text-muted-foreground text-sm font-light tracking-wide max-w-2xl">
          {subtitle}
        </p>
      </header>

      {/* ── Role-Specific Content with Suspense boundaries ── */}
      {effectiveRole === "student" && (
        <Suspense fallback={studentFallback}>
          <StudentDashboardContent
            user={{ ...user, role: effectiveRole as string }}
            component={studentComponent}
          />
        </Suspense>
      )}

      {effectiveRole === "company_admin" && (
        <RecruiterDashboard
          user={{ ...user, role: effectiveRole as string }}
          assistantEnabled={assistantEnabled}
        />
      )}
      {isDeptHead && (
        <DeptHeadDashboard user={{ ...user, role: effectiveRole as string }} />
      )}
      {((effectiveRole === "university_admin" && !isDeptHead) ||
        effectiveRole === "super_admin") && (
        <AdminDashboard user={{ ...user, role: effectiveRole as string }} />
      )}
    </div>
  )
}
