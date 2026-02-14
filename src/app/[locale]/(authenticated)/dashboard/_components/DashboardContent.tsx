import { getTranslations } from "next-intl/server";
import { localeRedirect } from "@/lib/navigation";
import { Suspense } from "react";

import { requireRole } from "@/lib/auth-guards";
import { getStudentDashboardStats } from "@/server/services/students/get-dashboard-stats";
import { getStudentProfile } from "@/server/services/students/get-profile";
import { listApplicationsByStudent } from "@/server/services/applications/list-by-student";
import { searchOffers } from "@/server/services/offers/search";
import { calculateProfileCompleteness } from "@/lib/profile-completeness";
import type { StudentDashboardData } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types";

interface DashboardContentProps {
  studentFallback: React.ReactNode;
  studentComponent: React.ComponentType<{
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string | null | undefined;
    };
    data: StudentDashboardData;
  }>;
  recruiterComponent: React.ComponentType<{
    user: { id: string; name: string | null; email: string; role: string };
  }>;
  adminComponent: React.ComponentType<{
    user: { id: string; name: string | null; email: string; role: string };
  }>;
}

async function StudentDashboardContent({
  user,
  component: Component,
}: {
  user: { id: string; name: string | null; email: string; role: string };
  component: React.ComponentType<{
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string | null | undefined;
    };
    data: StudentDashboardData;
  }>;
}) {
  const [stats, recentAppsResult, profile, recommendedResult] =
    await Promise.all([
      getStudentDashboardStats(user.id),
      listApplicationsByStudent(user.id, { limit: 5 }),
      getStudentProfile(user.id),
      searchOffers({ limit: 3 }),
    ]);

  const profileCompleteness = calculateProfileCompleteness({
    bio: profile?.profile.bio,
    phone: profile?.profile.phone,
    wilayaCode: profile?.profile.wilayaCode,
    githubUrl: profile?.profile.githubUrl,
    portfolioUrl: profile?.profile.portfolioUrl,
    studentNumber: profile?.profile.studentNumber,
    department: profile?.profile.department,
    skillsCount: profile?.skills.length ?? 0,
  });

  const studentData: StudentDashboardData = {
    stats: {
      totalApplications: stats.totalApplications,
      pendingApplications: stats.pendingApplications,
      acceptedApplications: stats.acceptedApplications,
      skillsCount: stats.skillsCount,
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
  };

  return <Component user={user} data={studentData} />;
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
}: DashboardContentProps) {
  const [user, t] = await Promise.all([
    requireRole([
      "student",
      "company_admin",
      "university_admin",
      "super_admin",
    ]),
    getTranslations("dashboard"),
  ]);

  // Redirects for incomplete onboarding
  if (user.role === "student" && !user.onboardingCompleted) {
    return localeRedirect("/onboarding/student");
  }

  const greeting = t("welcome");

  const roleSubtitleKey = {
    student: "student.subtitle",
    company_admin: "recruiter.subtitle",
    university_admin: "admin.subtitle",
    super_admin: "admin.subtitle",
  } as const;

  const subtitle = t(
    roleSubtitleKey[user.role as keyof typeof roleSubtitleKey] ||
      "student.subtitle",
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* ── Page Header (static, no data fetching) ── */}
      <header className="space-y-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
          {t(
            `roles.${
              user.role === "company_admin"
                ? "recruiter"
                : user.role === "super_admin"
                  ? "university_admin"
                  : user.role
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
      {user.role === "student" && (
        <Suspense fallback={studentFallback}>
          <StudentDashboardContent
            user={{ ...user, role: user.role as string }}
            component={studentComponent}
          />
        </Suspense>
      )}

      {user.role === "company_admin" && (
        <RecruiterDashboard user={{ ...user, role: user.role as string }} />
      )}
      {(user.role === "university_admin" || user.role === "super_admin") && (
        <AdminDashboard user={{ ...user, role: user.role as string }} />
      )}
    </div>
  );
}
