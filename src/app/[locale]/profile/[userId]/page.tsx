import { notFound } from "next/navigation"

import { requireRole } from "@/lib/auth-guards"
import { calculateProfileCompleteness } from "@/lib/profile-completeness"
import { getStudentDashboardStats } from "@/server/services/students/get-dashboard-stats"
import { getStudentProfileForViewer } from "@/server/services/students/get-profile-for-viewer"
import { getUniversityById } from "@/server/services/universities/get"

import { ProfileContent } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent"

type Params = Promise<{ userId: string }>

export default async function PublicProfilePage({ params }: { params: Params }) {
  const [viewer, { userId }] = await Promise.all([
    requireRole(["student", "company_admin", "admin", "super_admin"]),
    params,
  ])

  const result = await getStudentProfileForViewer({
    viewer: { id: viewer.id, role: viewer.role },
    targetUserId: userId,
  })

  if (!result) notFound()

  const [university, ownerStats] = await Promise.all([
    result.user.universityId ? getUniversityById(result.user.universityId) : null,
    viewer.id === userId && viewer.role === "student"
      ? getStudentDashboardStats(viewer.id)
      : null,
  ])

  const profileCompleteness =
    viewer.id === userId && viewer.role === "student"
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
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <ProfileContent
          viewer={{ id: viewer.id, role: viewer.role }}
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
      </div>
    </main>
  )
}
