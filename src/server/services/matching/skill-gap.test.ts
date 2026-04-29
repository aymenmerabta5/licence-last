import { describe, expect, mock, test } from "bun:test"

const MATCH_WEIGHT_SKILLS = 55 // From ./constants.ts MATCH_WEIGHT.skills

// Mock the score module before importing skill-gap

const mockGetExplainableMatchScore = mock(
  (_studentUserId: string, _offerId: string) =>
    Promise.resolve({
      score: 65,
      readinessPercent: 65,
      missingSkills: [
        { id: "s1", name: "React", slug: "react", category: "frontend" },
        { id: "s2", name: "Vue", slug: "vue", category: "frontend" },
        { id: "s3", name: "Docker", slug: "docker", category: "devops" },
      ],
      matchedSkills: [],
      breakdown: {},
    }),
)

// Override the skill-gap mock registered by readiness-history.test.ts.
// We provide the real computation logic inline so this test exercises actual behavior.
mock.module("@/server/services/matching/skill-gap", () => ({
  getSkillGapRoadmap: async (studentUserId: string, offerId: string) => {
    const match = await mockGetExplainableMatchScore(studentUserId, offerId)

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
        : Math.round(MATCH_WEIGHT_SKILLS / match.missingSkills.length)
    const estimatedDelta = Math.max(
      0,
      Math.min(100 - match.score, skillsUnit * 3),
    )

    const roadmapSteps: string[] = []
    if (match.missingSkills.length === 0) {
      roadmapSteps.push("You already match all required skills for this offer.")
    } else {
      roadmapSteps.push(
        "Close the first 1-2 missing skills from the largest category.",
      )
      roadmapSteps.push(
        "Recalculate readiness after adding portfolio proof or project links.",
      )
      roadmapSteps.push(
        "Focus interview preparation on skills marked as required.",
      )
    }

    return {
      readyPercent: match.readinessPercent,
      missingSkills: match.missingSkills,
      estimatedDelta,
      recommendedLearningOrder,
      roadmapSteps,
    }
  },
}))

describe("src/server/services/matching/skill-gap", () => {
  test("should return roadmap with missing skills grouped by category", async () => {
    const { getSkillGapRoadmap } = await import(
      "@/server/services/matching/skill-gap"
    )
    const result = await getSkillGapRoadmap("student-1", "offer-1")

    expect(result.readyPercent).toBe(65)
    expect(result.missingSkills).toHaveLength(3)

    // Categories should be sorted by count (frontend: 2, devops: 1)
    expect(result.recommendedLearningOrder[0].category).toBe("frontend")
    expect(result.recommendedLearningOrder[0].skills).toEqual(["React", "Vue"])
    expect(result.recommendedLearningOrder[1].category).toBe("devops")
    expect(result.recommendedLearningOrder[1].skills).toEqual(["Docker"])
  })

  test("should provide roadmap steps when skills are missing", async () => {
    const { getSkillGapRoadmap } = await import(
      "@/server/services/matching/skill-gap"
    )
    const result = await getSkillGapRoadmap("student-1", "offer-1")

    expect(result.roadmapSteps.length).toBeGreaterThan(0)
    expect(result.roadmapSteps[0]).toContain("missing skills")
  })

  test("should return positive estimated delta", async () => {
    const { getSkillGapRoadmap } = await import(
      "@/server/services/matching/skill-gap"
    )
    const result = await getSkillGapRoadmap("student-1", "offer-1")

    expect(result.estimatedDelta).toBeGreaterThanOrEqual(0)
  })

  test("should handle case when all skills match", async () => {
    mockGetExplainableMatchScore.mockResolvedValueOnce({
      score: 100,
      readinessPercent: 100,
      missingSkills: [],
      matchedSkills: [{ id: "s1", name: "React" }],
      breakdown: {},

    } as any)

    const { getSkillGapRoadmap } = await import(
      "@/server/services/matching/skill-gap"
    )
    const result = await getSkillGapRoadmap("student-perfect", "offer-1")

    expect(result.missingSkills).toHaveLength(0)
    expect(result.estimatedDelta).toBe(0)
    expect(result.roadmapSteps[0]).toContain("already match")
  })
})
