import { notFound } from "next/navigation"
import { and, eq } from "drizzle-orm"
import { ProfileContent } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent"
import { requireRole } from "@/lib/auth-guards"
import { calculateProfileCompleteness } from "@/lib/profile-completeness"
import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { companyMember } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { getStudentCv } from "@/server/services/students/get-cv"
import { getStudentDashboardStats } from "@/server/services/students/get-dashboard-stats"
import { getPublicStudentProfile } from "@/server/services/students/get-public-profile"
import { getUniversityById } from "@/server/services/universities/get"

interface ProfileDataProps {
  userId: string
}

/**
 * Server component that handles auth check and data fetching for profile page.
 * Separated to support Next.js 16 cacheComponents with Suspense boundary.
 */
export async function ProfileData({ userId }: ProfileDataProps) {
  const viewer = await requireRole([
    "student",
    "company_admin",
    "university_admin",
    "super_admin",
  ])
  const isOwner = viewer.id === userId && viewer.role === "student"
  if (viewer.role === "student" && !isOwner) notFound()

  // Company admins can only view profiles of students who applied to their offers
  if (viewer.role === "company_admin") {
    const [membership] = await db
      .select({ companyId: companyMember.companyId })
      .from(companyMember)
      .where(eq(companyMember.userId, viewer.id))
      .limit(1)

    if (!membership) notFound()

    const [hasRelationship] = await db
      .select({ id: application.id })
      .from(application)
      .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
      .where(
        and(
          eq(application.studentUserId, userId),
          eq(internshipOffer.companyId, membership.companyId),
        ),
      )
      .limit(1)

    if (!hasRelationship) notFound()
  }

  const result = await getPublicStudentProfile(
    { id: viewer.id, role: viewer.role },
    userId,
  )

  if (!result) notFound()

  const [university, ownerStats, cvData] = await Promise.all([
    result.user.universityId
      ? getUniversityById(result.user.universityId)
      : null,
    isOwner ? getStudentDashboardStats(viewer.id) : null,
    result.user.role === "student" ? getStudentCv(userId) : null,
  ])

  const profileCompleteness = isOwner
    ? calculateProfileCompleteness({
        bio: result.profile?.bio ?? null,
        phone: result.profile?.phone ?? null,
        wilayaCode: result.profile?.wilayaCode ?? null,
        githubUrl: result.profile?.githubUrl ?? null,
        portfolioUrl: result.profile?.portfolioUrl ?? null,
        studentNumber: result.profile?.studentNumber ?? null,
        department: result.profile?.department ?? null,
        skillsCount: result.skills.length,
      })
    : null

  const studentData =
    result.user.role === "student"
      ? {
          profile: result.profile,
          skills: result.skills,
          experiences: cvData?.experiences ?? [],
          university,
          stats:
            ownerStats && profileCompleteness !== null
              ? {
                  totalApplications: ownerStats.totalApplications,
                  skillsCount: ownerStats.skillsCount,
                  profileCompleteness,
                }
              : null,
        }
      : undefined

  return (
    <ProfileContent
      viewer={{ id: viewer.id, role: viewer.role ?? "student" }}
      user={{
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        image: result.user.image,
        createdAt: result.user.createdAt.toISOString(),
      }}
      studentData={studentData}
    />
  )
}
