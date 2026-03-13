import type { ValidationDetailData } from "@/app/[locale]/(authenticated)/dashboard/_components/PlacementValidations/types"

export function formatDate(
  date: Date | string | null,
  locale: string,
  fallback: string,
): string {
  if (!date) return fallback
  const parsedDate = typeof date === "string" ? new Date(date) : date

  return parsedDate.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function buildValidationSummaryInput(application: ValidationDetailData) {
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
