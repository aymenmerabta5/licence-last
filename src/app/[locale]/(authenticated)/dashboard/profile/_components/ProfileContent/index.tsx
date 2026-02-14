"use client"

import { useTranslations } from "next-intl"

import type { ProfileContentProps } from "./types"
import { useProfileData } from "./hooks/useProfileData"
import { ProfileHeader } from "./components/ProfileHeader"
import { ProfileStats } from "./components/ProfileStats"
import { ContactInfoCard } from "./components/ContactInfoCard"
import { SkillsCard, EmptyState } from "./components/SkillsCard"
import { SocialLinks } from "./components/SocialLinks"
import { BioSection } from "./components/BioSection"
import { EducationSection } from "./components/EducationSection"
import { ExperienceSection } from "./components/ExperienceSection"

function buildProfileText(
  user: ProfileContentProps["user"],
  profile: ReturnType<typeof useProfileData>["profile"],
  skills: ReturnType<typeof useProfileData>["skills"],
  university: ReturnType<typeof useProfileData>["university"],
): string {
  const lines: string[] = []
  lines.push(user.name || "Anonymous User")
  if (user.email) lines.push(user.email)
  if (profile?.phone) lines.push(profile.phone)
  if (profile?.department) {
    const dept = profile.level ? `${profile.department} — ${profile.level}` : profile.department
    lines.push(dept)
  }
  if (university) lines.push(university.name)
  if (profile?.bio) {
    lines.push("")
    lines.push(profile.bio)
  }
  if (skills.length > 0) {
    lines.push("")
    lines.push(`Skills: ${skills.map((s) => s.name).join(", ")}`)
  }
  if (profile?.githubUrl) lines.push(`GitHub: ${profile.githubUrl}`)
  if (profile?.portfolioUrl) lines.push(`Portfolio: ${profile.portfolioUrl}`)
  return lines.join("\n")
}

export function ProfileContent({ viewer, user, studentData }: ProfileContentProps) {
  const t = useTranslations("dashboard")
  const { canEdit, profile, stats, university, skills } = useProfileData(
    viewer,
    user,
    studentData,
  )

  const profileText = buildProfileText(user, profile, skills, university)

  const sidebarLabels = {
    personalInfo: t("student.profile.personalInfo"),
    email: t("student.profile.email"),
    phone: t("student.profile.phone"),
    location: t("student.profile.location"),
    studentNumber: t("student.profile.studentNumber"),
    department: t("student.profile.department"),
  }

  const skillsLabels = {
    skills: t("student.profile.skills"),
    addSkills: "Add Skills",
    emptyMessage: "Add your technical skills to stand out to recruiters",
  }

  const socialLabels = {
    links: t("student.profile.links"),
  }

  const bioLabels = {
    bio: t("student.profile.bio"),
    emptyMessage: "No bio added yet. Tell companies and recruiters about yourself, your interests, and what kind of internship you are looking for.",
    writeBio: "Write your bio",
  }

  const educationLabels = {
    education: "Education",
    emptyMessage: "Your education history will appear here once you complete your profile.",
    addEducation: "Add Education",
  }

  const experienceLabels = {
    experience: "Experience",
    emptyMessage: "Add your work experience, open source contributions, or personal projects to strengthen your profile.",
    addExperience: "Add Experience",
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Editorial Masthead */}
      <ProfileHeader
        user={user}
        editButtonLabel={t("student.profile.edit")}
        canEdit={canEdit}
        profileText={profileText}
      />

      {/* Stats Bulletin */}
      {stats.length > 0 && <ProfileStats stats={stats} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-10">
          <ContactInfoCard
            user={user}
            profile={profile}
            labels={sidebarLabels}
          />
          <SkillsCard
            skills={skills}
            labels={skillsLabels}
            canEdit={canEdit}
          />
          <SocialLinks
            profile={profile}
            labels={socialLabels}
          />
        </div>

        {/* Main Column */}
        <div className="lg:col-span-8 space-y-12">
          <BioSection
            profile={profile}
            labels={bioLabels}
            canEdit={canEdit}
          />
          <EducationSection
            profile={profile}
            university={university}
            labels={educationLabels}
            canEdit={canEdit}
          />
          <ExperienceSection labels={experienceLabels} canEdit={canEdit} />
        </div>
      </div>
    </div>
  )
}

export { EmptyState }
