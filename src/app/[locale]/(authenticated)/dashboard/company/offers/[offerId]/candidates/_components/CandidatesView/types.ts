import type { PipelineStage } from "@/lib/constants/pipeline"

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

export interface RefuseModalState {
  applicationId: string
  studentName: string
}
