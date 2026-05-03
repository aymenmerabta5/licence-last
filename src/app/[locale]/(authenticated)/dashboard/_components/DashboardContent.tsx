import { getTranslations } from "next-intl/server"
import { Suspense } from "react"
import type {
  AdminStats,
  TrustIndex,
  UniversityDashboardStats,
} from "@/app/[locale]/(authenticated)/_components/AdminDashboard/hooks/useAdminDashboardData"
import type {
  CompanyTrustIndex,
  OfferWithSkills,
} from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/hooks/useRecruiterDashboardData"
import type { StudentDashboardData } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"
import { requireDashboardUser } from "@/lib/dashboard-access"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { localeRedirect } from "@/lib/navigation"
import { calculateProfileCompleteness } from "@/lib/profile-completeness"
import { listApplicationsByStudent } from "@/server/services/applications/list-by-student"
import {
  getCompanyTrustIndex,
  listCompanyTrustIndices,
} from "@/server/services/companies/trust-index"
import { getCompanyMembership } from "@/server/services/companies/membership"
import { listInterviewsForStudent } from "@/server/services/interviews/list-for-student"
import { listOffersByCompany } from "@/server/services/offers/list-by-company"
import { recommendOffersForStudent } from "@/server/services/offers/recommend"
import { Skeleton } from "@/components/ui/skeleton"
import { getAdminStats } from "@/server/services/stats/get-admin-stats"
import { getUniversityDashboardStats } from "@/server/services/stats/get-university-dashboard-stats"
import { getStudentDashboardStats } from "@/server/services/students/get-dashboard-stats"
import { getStudentProfile } from "@/server/services/students/get-profile"

function StudentFallback() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 rounded" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 rounded" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

function RecruiterFallback() {
  return (
    <div className="space-y-12">
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-10">
          <Skeleton className="h-80 rounded-2xl" />
        </div>
        <div className="lg:col-span-5 space-y-10">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

function AdminFallback() {
  return (
    <div className="space-y-8 sm:space-y-12">
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-56 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

interface DashboardContentProps {
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
    initialOffers?: OfferWithSkills[]
    initialTrustData?: CompanyTrustIndex | null
  }>
  adminComponent: React.ComponentType<{
    user: { id: string; name: string | null; email: string; role: string }
    initialStats?: AdminStats
    initialUniversityStats?: UniversityDashboardStats
    initialTrustIndices?: TrustIndex[]
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
  const [
    stats,
    recentAppsResult,
    profile,
    recommendedResult,
    pendingInterviews,
  ] = await Promise.all([
    getStudentDashboardStats(user.id),
    listApplicationsByStudent(user.id, { limit: 5 }),
    getStudentProfile(user.id),
    recommendOffersForStudent({ studentUserId: user.id, limit: 3 }),
    listInterviewsForStudent(user.id, {
      status: "pending_confirmation",
      limit: 1,
    }),
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
    pendingInterview:
      pendingInterviews.length > 0
        ? {
            id: pendingInterviews[0].id,
            offerTitle: pendingInterviews[0].offerTitle,
            companyName: pendingInterviews[0].companyName,
            companyLogoUrl: pendingInterviews[0].companyLogoUrl,
          }
        : null,
  }

  return <Component user={user} data={studentData} />
}

async function RecruiterDashboardWrapper({
  user,
  assistantEnabled,
  recruiterComponent: RecruiterDashboard,
}: {
  user: { id: string; name: string | null; email: string; role: string }
  assistantEnabled: boolean
  recruiterComponent: DashboardContentProps["recruiterComponent"]
}) {
  const membership = await getCompanyMembership(user.id)
  const companyId = membership?.companyId

  const [offers, trustData] = await Promise.all([
    companyId ? listOffersByCompany(companyId) : Promise.resolve([]),
    companyId ? getCompanyTrustIndex(companyId) : Promise.resolve(null),
  ])

  return (
    <RecruiterDashboard
      user={user}
      assistantEnabled={assistantEnabled}
      initialOffers={offers}
      initialTrustData={trustData}
    />
  )
}

async function AdminDashboardWrapper({
  user,
  adminComponent: AdminDashboard,
}: {
  user: { id: string; name: string | null; email: string; role: string }
  adminComponent: DashboardContentProps["adminComponent"]
}) {
  const isSuperAdmin = user.role === "super_admin"
  const isUniversityAdmin = user.role === "university_admin"

  const [stats, universityStats, trustIndices] = await Promise.all([
    isSuperAdmin ? getAdminStats() : Promise.resolve(undefined),
    isUniversityAdmin && (user as { universityId?: string | null }).universityId
      ? getUniversityDashboardStats(
          (user as { universityId?: string | null }).universityId as string,
        )
      : Promise.resolve(undefined),
    isSuperAdmin ? listCompanyTrustIndices(5) : Promise.resolve(undefined),
  ])

  return (
    <AdminDashboard
      user={user}
      initialStats={stats}
      initialUniversityStats={universityStats}
      initialTrustIndices={trustIndices}
    />
  )
}

/**
 * Dashboard content component that handles auth and data fetching.
 * Separated to support Next.js 16 cacheComponents with Suspense boundary.
 */
export async function DashboardContent({
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
        <Suspense fallback={<StudentFallback />}>
          <StudentDashboardContent
            user={{ ...user, role: effectiveRole as string }}
            component={studentComponent}
          />
        </Suspense>
      )}

      {effectiveRole === "company_admin" && (
        <Suspense fallback={<RecruiterFallback />}>
          <RecruiterDashboardWrapper
            user={{ ...user, role: effectiveRole as string }}
            assistantEnabled={assistantEnabled}
            recruiterComponent={RecruiterDashboard}
          />
        </Suspense>
      )}
      {isDeptHead && (
        <DeptHeadDashboard user={{ ...user, role: effectiveRole as string }} />
      )}
      {((effectiveRole === "university_admin" && !isDeptHead) ||
        effectiveRole === "super_admin") && (
        <Suspense fallback={<AdminFallback />}>
          <AdminDashboardWrapper
            user={{ ...user, role: effectiveRole as string }}
            adminComponent={AdminDashboard}
          />
        </Suspense>
      )}
    </div>
  )
}
