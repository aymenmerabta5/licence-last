import type { InternshipType, WorkMode } from "./types"

export const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export const ease = [0.4, 0, 0.2, 1] as const

export const CATEGORY_ORDER = [
  "frontend",
  "backend",
  "languages",
  "database",
  "devops",
  "mobile",
  "data_ai",
  "other",
] as const

export function isInternshipType(value: string): value is InternshipType {
  return value === "pfe" || value === "immersion" || value === "summer" || value === "practical"
}

export function isWorkMode(value: string): value is WorkMode {
  return value === "on_site" || value === "hybrid" || value === "remote"
}

export function groupSkillsByCategory<TSkill extends { category?: string | null }>(
  skillTags: TSkill[],
): Record<string, TSkill[]> {
  const groups: Record<string, TSkill[]> = {}
  for (const skill of skillTags) {
    const cat = skill.category || "other"
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(skill)
  }
  return groups
}
