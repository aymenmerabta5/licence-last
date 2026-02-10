export type OfferCopilotIntent =
  | "offer_generate_draft"
  | "offer_improve_description"
  | "offer_suggest_skill_tags"

export type InternshipType = "pfe" | "immersion" | "summer" | "practical"
export type WorkMode = "on_site" | "hybrid" | "remote"

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
    skillTagIds: string[]
  }
}
