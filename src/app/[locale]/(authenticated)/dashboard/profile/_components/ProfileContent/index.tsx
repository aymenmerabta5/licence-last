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
  labels: {
    anonymousUser: string
    skillsLabel: string
    githubLabel: string
    portfolioLabel: string
  },
): string {
  const lines: string[] = []
  lines.push(user.name || labels.anonymousUser)
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
    lines.push(`${labels.skillsLabel}: ${skills.map((s) => s.name).join(", ")}`)
  }
  if (profile?.githubUrl) lines.push(`${labels.githubLabel}: ${profile.githubUrl}`)
  if (profile?.portfolioUrl) lines.push(`${labels.portfolioLabel}: ${profile.portfolioUrl}`)
  return lines.join("\n")
}

export function ProfileContent({ viewer, user, studentData }: ProfileContentProps) {
  const t = useTranslations("dashboard")
  const { canEdit, profile, stats, university, skills } = useProfileData(
    viewer,
    user,
    (key, values) => t(key, values),
    studentData,
  )

  const roleLabels: Record<string, string> = {
    student: t("student.profile.roles.student"),
    company_admin: t("student.profile.roles.company_admin"),
    dept_head: t("student.profile.roles.dept_head"),
    university_admin: t("student.profile.roles.university_admin"),
    super_admin: t("student.profile.roles.super_admin"),
  }
  const roleLabel = roleLabels[user.role || "student"] || user.role || t("student.profile.unknownRole")

  const profileText = buildProfileText(user, profile, skills, university, {
    anonymousUser: t("student.profile.anonymousUser"),
    skillsLabel: t("student.profile.skillsLabel"),
    githubLabel: t("student.profile.githubLabel"),
    portfolioLabel: t("student.profile.portfolioLabel"),
  })

  const sidebarLabels = {
    personalInfo: t("student.profile.personalInfo"),
    email: t("student.profile.email"),
    phone: t("student.profile.phone"),
    location: t("student.profile.location"),
    studentNumber: t("student.profile.studentNumber"),
    department: t("student.profile.department"),
    role: t("student.profile.role"),
    notSetYet: t("student.profile.notSetYet"),
  }

  const skillsLabels = {
    skills: t("student.profile.skills"),
    addSkills: t("student.profile.addSkills"),
    emptyMessage: t("student.profile.skillsEmptyMessage"),
  }

  const socialLabels = {
    links: t("student.profile.links"),
    github: t("student.profile.githubLabel"),
    portfolio: t("student.profile.portfolioLabel"),
  }

  const bioLabels = {
    bio: t("student.profile.bio"),
    emptyMessage: t("student.profile.bioEmptyMessage"),
    writeBio: t("student.profile.writeBio"),
  }

  const educationLabels = {
    education: t("student.profile.educationTitle"),
    emptyMessage: t("student.profile.educationEmptyMessage"),
    addEducation: t("student.profile.addEducation"),
    university: t("student.profile.university"),
  }

  const experienceLabels = {
    experience: t("student.profile.experienceTitle"),
    emptyMessage: t("student.profile.experienceEmptyMessage"),
    addExperience: t("student.profile.addExperience"),
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Editorial Masthead */}
      <ProfileHeader
        user={user}
        canEdit={canEdit}
        profileText={profileText}
        roleLabel={roleLabel}
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
            roleLabel={roleLabel}
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
