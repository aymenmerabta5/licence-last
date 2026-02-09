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

export function ProfileContent({ user, studentData }: ProfileContentProps) {
  const t = useTranslations("dashboard")
  const { isStudent, profile, stats, university, skills } = useProfileData(user, studentData)

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
      <ProfileHeader
        user={user}
        editButtonLabel={t("student.profile.edit")}
      />

      <ProfileStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <ContactInfoCard
            user={user}
            profile={profile}
            isStudent={isStudent}
            labels={sidebarLabels}
          />
          <SkillsCard
            skills={skills}
            isStudent={isStudent}
            labels={skillsLabels}
          />
          <SocialLinks
            profile={profile}
            labels={socialLabels}
          />
        </div>

        <div className="lg:col-span-8 space-y-10">
          <BioSection
            profile={profile}
            isStudent={isStudent}
            labels={bioLabels}
          />
          <EducationSection
            profile={profile}
            university={university}
            isStudent={isStudent}
            labels={educationLabels}
          />
          <ExperienceSection labels={experienceLabels} />
        </div>
      </div>
    </div>
  )
}

export { EmptyState }
