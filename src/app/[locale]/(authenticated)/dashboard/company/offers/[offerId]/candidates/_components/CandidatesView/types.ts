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
    image?: string | null
    email?: string | null
  }
  university: {
    name: string
    abbreviation: string | null
  } | null
  skills: Array<{
    id: string
    name: string
    slug: string
    category: string | null
  }>
  languages: Array<{
    languageCode: string
    proficiency: string
  }>
  skillMatchPercentage: number
  interviewPreview: {
    id: string
    status: string
    nextSlotStartsAt: string | Date | null
    nextSlotEndsAt: string | Date | null
    slotCount: number
  } | null
}

export interface CandidateFiltersState {
  skillTagIds: string[]
  languageCodes: string[]
}

export interface CandidateCardDragItem {
  applicationId: string
  fromStage: PipelineStage
  app: CandidateApp
}

export interface AcceptModalState {
  applicationId: string
  studentName: string
}

export interface RefuseModalState {
  applicationId: string
  studentName: string
}
