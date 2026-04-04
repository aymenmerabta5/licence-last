import { notFound } from "next/navigation"
import { and, eq } from "drizzle-orm"
import { ProfileContent } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent"
import { requireRole } from "@/lib/auth-guards"
import { calculateProfileCompleteness } from "@/lib/profile-completeness"

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
  const isSelf = viewer.id === userId
  const isOwner = isSelf && viewer.role === "student"
  if (viewer.role === "student" && !isSelf) notFound()

  // Company admins can only view profiles of students who applied to their offers,
  // unless they are viewing their own profile.
  if (viewer.role === "company_admin" && !isSelf) {
    const [{ db }, { companyMember }, { application }, { internshipOffer }] =
      await Promise.all([
        import("@/server/db"),
        import("@/server/db/schema/companies"),
        import("@/server/db/schema/applications"),
        import("@/server/db/schema/internships"),
      ])

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

  const { getPublicStudentProfile } = await import(
    "@/server/services/students/get-public-profile"
  )
  const result = await getPublicStudentProfile(
    {
      id: viewer.id,
      role: viewer.role,
      universityId: viewer.universityId,
      departmentId: viewer.departmentId,
      universityMembershipRole: viewer.universityMembershipRole,
    },
    userId,
  )

  if (!result) notFound()

  const universityId = result.user.universityId
  const [university, ownerStats, cvData] = await Promise.all([
    universityId
      ? (async () => {
          const { getUniversityById } = await import(
            "@/server/services/universities/get"
          )
          return getUniversityById(universityId)
        })()
      : null,
    isOwner
      ? (async () => {
          const { getStudentDashboardStats } = await import(
            "@/server/services/students/get-dashboard-stats"
          )
          return getStudentDashboardStats(viewer.id)
        })()
      : null,
    isOwner
      ? (async () => {
          const { getStudentCv } = await import(
            "@/server/services/students/get-cv"
          )
          return getStudentCv(userId)
        })()
      : null,
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
          languages: result.languages,
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
