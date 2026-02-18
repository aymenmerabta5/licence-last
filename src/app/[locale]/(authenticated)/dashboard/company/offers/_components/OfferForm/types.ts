import type { LanguageCode } from "@/lib/constants/languages"
import type { ProficiencyLevel } from "@/lib/schemas/enums"

export type OfferCopilotIntent =
  | "offer_generate_draft"
  | "offer_improve_description"
  | "offer_suggest_skill_tags"

export type InternshipType = "pfe" | "immersion" | "summer" | "practical"
export type WorkMode = "on_site" | "hybrid" | "remote"

export interface OfferLanguageRequirementValue {
  languageCode: LanguageCode
  minimumProficiency: ProficiencyLevel
  isRequired: boolean
  weight: number
}

export interface CopilotResult {
  intent: OfferCopilotIntent
  title?: string
  description?: string
  internshipType?: string
  workMode?: string | null
  wilayaCode?: number | null
  durationWeeks?: number | null
  maxPositions?: number
  applicationDeadlineAt?: string | null
  expectedStartDate?: string | null
  expectedEndDate?: string | null
  skillTagIds?: string[]
  skillTagNames?: string[]
  languageRequirements?: OfferLanguageRequirementValue[]
}

export interface OfferFormProps {
  mode: "create" | "edit"
  initialData?: {
    offerId: string
    title: string
    description: string
    internshipType: string
    workMode: string | null
    wilayaCode: number | null
    durationWeeks: number | null
    maxPositions: number
    applicationDeadlineAt: Date | string | null
    expectedStartDate: Date | string | null
    expectedEndDate: Date | string | null
    skillTagIds: string[]
    languageRequirements?: OfferLanguageRequirementValue[]
  }
}
