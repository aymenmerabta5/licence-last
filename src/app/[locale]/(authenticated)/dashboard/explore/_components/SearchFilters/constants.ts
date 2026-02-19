export const INTERNSHIP_TYPES = [
  "pfe",
  "immersion",
  "summer",
  "practical",
] as const
export const WORK_MODES = ["on_site", "hybrid", "remote"] as const

export const TYPE_DOT: Record<string, string> = {
  pfe: "bg-purple-500",
  immersion: "bg-blue-500",
  summer: "bg-amber-500",
  practical: "bg-emerald-500",
}
