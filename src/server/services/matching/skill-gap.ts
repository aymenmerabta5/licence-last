import "server-only"

import { getExplainableMatchScore } from "./score"
import { MATCH_WEIGHT } from "./constants"

export interface SkillGapRoadmap {
  readyPercent: number
  missingSkills: Array<{
    id: string
    name: string
    slug: string
    category: string | null
  }>
  estimatedDelta: number
  recommendedLearningOrder: Array<{
    category: string
    skills: string[]
  }>
  roadmapSteps: string[]
}

export async function getSkillGapRoadmap(
  studentUserId: string,
  offerId: string,
): Promise<SkillGapRoadmap> {
  const match = await getExplainableMatchScore(studentUserId, offerId)

  const grouped = new Map<string, string[]>()
  for (const skill of match.missingSkills) {
    const key = skill.category ?? "general"
    const existing = grouped.get(key) ?? []
    existing.push(skill.name)
    grouped.set(key, existing)
  }

  const recommendedLearningOrder = [...grouped.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([category, skills]) => ({ category, skills }))

  const skillsUnit =
    match.missingSkills.length === 0
      ? 0
      : Math.round(MATCH_WEIGHT.skills / match.missingSkills.length)
  const estimatedDelta = Math.max(0, Math.min(100 - match.score, skillsUnit * 3))

  const roadmapSteps: string[] = []
  if (match.missingSkills.length === 0) {
    roadmapSteps.push("You already match all required skills for this offer.")
  } else {
    roadmapSteps.push("Close the first 1-2 missing skills from the largest category.")
    roadmapSteps.push("Recalculate readiness after adding portfolio proof or project links.")
    roadmapSteps.push("Focus interview preparation on skills marked as required.")
  }

  return {
    readyPercent: match.readinessPercent,
    missingSkills: match.missingSkills,
    estimatedDelta,
    recommendedLearningOrder,
    roadmapSteps,
  }
}
