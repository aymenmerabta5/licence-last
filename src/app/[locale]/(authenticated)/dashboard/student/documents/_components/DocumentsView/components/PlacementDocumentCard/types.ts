export interface PlacementDocument {
  id: string
  type: "agreement" | "certificate"
  status: "pending" | "generated" | "failed"
  verificationCode: string | null
  createdAt: Date | string
}

export interface PlacementSummary {
  placementId: string
  offerTitle: string
  internshipType: string
  companyName: string
  startDate: Date | string
  endDate: Date | string
  validatedAt: Date | string
  documents: PlacementDocument[]
}

export interface FeedbackPlacementSummary {
  placementId: string
  companyName: string
  offerTitle: string
}

export interface PlacementDocumentCardProps {
  placement: PlacementSummary
  downloadingDocumentId: string | null
  onDownload: (documentId: string) => void
  onOpenFeedback: (placement: FeedbackPlacementSummary) => void
}
