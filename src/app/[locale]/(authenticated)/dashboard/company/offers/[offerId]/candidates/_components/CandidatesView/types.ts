import type { PipelineStage } from "@/lib/constants/pipeline"

export const CANDIDATE_CARD_DND_TYPE = "candidate-card"

export interface CandidateApp {
  id: string
  status: string
  pipelineStage: PipelineStage
  createdAt: string | Date
  coverLetter: string | null
  student: {
    id: string
    name: string | null
  }
  university: {
    name: string
    abbreviation: string | null
  } | null
}

export interface CandidateCardDragItem {
  applicationId: string
  fromStage: PipelineStage
}

export interface RefuseModalState {
  applicationId: string
  studentName: string
}
