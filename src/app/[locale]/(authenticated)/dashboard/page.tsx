import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { requireRole } from "@/lib/auth-guards"
import { StudentDashboard } from "@/app/[locale]/(authenticated)/_components/StudentDashboard"
import { RecruiterDashboard } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard"
import { AdminDashboard } from "@/app/[locale]/(authenticated)/_components/AdminDashboard"
import { getStudentDashboardStats } from "@/server/services/students/get-dashboard-stats"
import { getStudentProfile } from "@/server/services/students/get-profile"
import { listApplicationsByStudent } from "@/server/services/applications/list-by-student"
import { searchOffers } from "@/server/services/offers/search"
import { calculateProfileCompleteness } from "@/lib/profile-completeness"

export default async function DashboardPage() {
  const [user, locale, t] = await Promise.all([
    requireRole(["student", "company_admin", "admin", "super_admin"]),
    getLocale(),
    getTranslations("dashboard"),
  ])

  if (user.role === "student" && !user.onboardingCompleted) {
    redirect(`/${locale}/onboarding/student`)
  }

  if (user.role === "company_admin" && !user.onboardingCompleted) {
    redirect(`/${locale}/onboarding/company`)
  }

  const greeting = t("welcome")

  const roleSubtitleKey = {
    student: "student.subtitle",
    company_admin: "recruiter.subtitle",
    admin: "admin.subtitle",
    super_admin: "admin.subtitle",
  } as const

  const subtitle = t(roleSubtitleKey[user.role as keyof typeof roleSubtitleKey] || "student.subtitle")

  // Fetch student-specific data in parallel
  let studentData = undefined
  if (user.role === "student") {
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

    studentData = {
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
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* ── Page Header ── */}
      <header className="space-y-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
          {t(`roles.${user.role === "company_admin" ? "recruiter" : user.role === "super_admin" ? "admin" : user.role}`)} Dashboard
        </p>
        <h1 className="font-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-none tracking-tight text-heading">
          {greeting} <span className="text-primary">{user.name?.split(" ")[0] || "User"}</span>
        </h1>
        <p className="text-muted-foreground text-sm font-light tracking-wide max-w-2xl">
          {subtitle}
        </p>
      </header>

      {/* ── Role-Specific Content ── */}
      {user.role === "student" && <StudentDashboard user={user} data={studentData!} />}
      {user.role === "company_admin" && <RecruiterDashboard user={user} />}
      {(user.role === "admin" || user.role === "super_admin") && <AdminDashboard user={user} />}
    </div>
  )
}
