export type PlacementDocumentType = "agreement" | "certificate"

export type PlacementDocumentStatus = "pending" | "generated" | "failed"

export interface PlacementDocument {
  id: string
  type: PlacementDocumentType
  status: PlacementDocumentStatus
  verificationCode: string | null
  createdAt: Date | string
}

export interface CompanyPlacementDocumentSummary {
  placementId: string
  offerTitle: string
  internshipType: string
  studentName: string | null
  studentEmail: string
  startDate: Date | string
  endDate: Date | string
  validatedAt: Date | string
  documents: PlacementDocument[]
}
