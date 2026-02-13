import type { PipelineStage } from "@/lib/constants/pipeline"

export interface ApplicationItem {
  id: string
  offerId: string
  offerTitle: string
  companyName: string
  offerWilayaCode: number | null
  status: string
  pipelineStage: PipelineStage
  createdAt: string | Date
}

export interface TimelineEvent {
  id: string
  eventType: string
  fromStage: string | null
  toStage: string | null
  createdAt: string | Date
}
