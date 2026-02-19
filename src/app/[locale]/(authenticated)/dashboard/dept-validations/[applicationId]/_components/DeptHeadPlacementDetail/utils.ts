import type { DeptHeadPlacementApplication } from "@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/types"

export function buildValidationSummaryInput(
  application: DeptHeadPlacementApplication,
) {
  return {
    id: application.id,
    createdAt: application.createdAt,
    companyActionAt: application.companyActionAt,
    coverLetter: application.coverLetter,
    student: { name: application.student?.name ?? null },
    profile: {
      level: application.profile?.level ?? null,
      department: application.profile?.department ?? null,
    },
    university: application.university
      ? {
          name: application.university.name ?? null,
          abbreviation: application.university.abbreviation ?? null,
        }
      : null,
    offer: {
      title: application.offer?.title ?? null,
      internshipType: application.offer?.internshipType ?? null,
      workMode: application.offer?.workMode ?? null,
      wilayaCode: application.offer?.wilayaCode ?? null,
      durationWeeks: application.offer?.durationWeeks ?? null,
    },
    company: { name: application.company?.name ?? null },
    skills: application.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      category: skill.category ?? null,
    })),
  }
}
