export interface OfferDetailProps {
  offer: {
    id: string
    companyId: string
    title: string
    description: string
    internshipType: string
    workMode: string | null
    wilayaCode: number | null
    durationWeeks: number | null
    maxPositions: number
    status: "draft" | "published" | "closed"
    applicationDeadlineAt: Date | null
    expectedStartDate: Date | null
    expectedEndDate: Date | null
    closesAt: Date | null
    createdAt: Date
    companyName: string
    companySlug: string
    companyLogoUrl: string | null
    companyDescription: string | null
    companyWilayaCode: number | null
    companyAddress: string | null
    applicationCount: number
    skills: {
      id: string
      name: string
      slug: string
      category: string | null
    }[]
  }
  existingApplication: {
    id: string
    status: string
    createdAt: Date
  } | null
  studentUserId: string
}
