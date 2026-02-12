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
