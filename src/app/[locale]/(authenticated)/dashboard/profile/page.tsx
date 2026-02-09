import { requireRole } from "@/lib/auth-guards"
import { ProfileContent } from "./_components/ProfileContent"
import { getStudentProfile } from "@/server/services/students/get-profile"
import { getStudentDashboardStats } from "@/server/services/students/get-dashboard-stats"
import { getUniversityById } from "@/server/services/universities/get"
import { calculateProfileCompleteness } from "@/lib/profile-completeness"

export default async function ProfilePage() {
  const user = await requireRole(["student", "company_admin", "admin", "super_admin"])

  let studentData = undefined
  if (user.role === "student") {
    const [profile, stats, university] = await Promise.all([
      getStudentProfile(user.id),
      getStudentDashboardStats(user.id),
      user.universityId ? getUniversityById(user.universityId) : null,
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
      profile: profile?.profile ?? null,
      skills: profile?.skills ?? [],
      stats: {
        totalApplications: stats.totalApplications,
        skillsCount: stats.skillsCount,
        profileCompleteness,
      },
      university,
    }
  }

  return (
    <ProfileContent
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        createdAt: user.createdAt.toISOString(),
      }}
      studentData={studentData}
    />
  )
}
