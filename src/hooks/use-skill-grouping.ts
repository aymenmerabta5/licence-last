import { useMemo } from "react"

const CATEGORY_ORDER = [
  "frontend",
  "backend",
  "languages",
  "database",
  "devops",
  "mobile",
  "data_ai",
  "software_engineering",
  "math_stats",
  "science",
  "electronics",
  "engineering",
  "architecture",
  "law",
  "economics",
  "humanities",
  "general",
] as const

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  languages: "Languages",
  database: "Database",
  devops: "DevOps",
  mobile: "Mobile",
  data_ai: "Data & AI",
  software_engineering: "Software Engineering",
  math_stats: "Math & Statistics",
  science: "Science & Research",
  electronics: "Electronics & Embedded",
  engineering: "Engineering",
  architecture: "Architecture & Design",
  law: "Law",
  economics: "Economics & Business",
  humanities: "Humanities & Languages",
  general: "General",
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
      const cat = skill.category || "general"
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(skill)
    }

    // Build dynamic order: show CATEGORY_ORDER categories first, then any extras
    const knownSet = new Set<string>(CATEGORY_ORDER)
    const extraCategories = Object.keys(groups).filter((c) => !knownSet.has(c))
    const categoryOrder = [...CATEGORY_ORDER, ...extraCategories]

    return {
      groups,
      categoryOrder,
      categoryLabels: CATEGORY_LABELS,
    }
  }, [skills])
}

export { CATEGORY_ORDER, CATEGORY_LABELS }
