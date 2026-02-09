import { useMemo } from "react"

const CATEGORY_ORDER = [
  "frontend",
  "backend",
  "languages",
  "database",
  "devops",
  "mobile",
  "data_ai",
  "other",
] as const

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  languages: "Languages",
  database: "Database",
  devops: "DevOps",
  mobile: "Mobile",
  data_ai: "Data & AI",
  other: "Other",
}

interface SkillTag {
  id: string
  name: string
  slug: string
  category: string | null
}

export function useSkillGrouping(skills: SkillTag[]) {
  return useMemo(() => {
    const groups: Record<string, SkillTag[]> = {}
    
    for (const skill of skills) {
      const cat = skill.category || "other"
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(skill)
    }
    
    return {
      groups,
      categoryOrder: CATEGORY_ORDER,
      categoryLabels: CATEGORY_LABELS,
    }
  }, [skills])
}

export { CATEGORY_ORDER, CATEGORY_LABELS }
