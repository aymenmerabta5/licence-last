import { describe, test, expect } from "bun:test"
import { renderHook } from "@testing-library/react"

import { useSkillGrouping, CATEGORY_ORDER, CATEGORY_LABELS } from "./use-skill-grouping"

describe("useSkillGrouping", () => {
  const skills = [
    { id: "1", name: "React", slug: "react", category: "frontend" },
    { id: "2", name: "Vue", slug: "vue", category: "frontend" },
    { id: "3", name: "Node.js", slug: "nodejs", category: "backend" },
    { id: "4", name: "Python", slug: "python", category: "languages" },
    { id: "5", name: "Unknown", slug: "unknown", category: null },
  ]

  test("should group skills by category", () => {
    const { result } = renderHook(() => useSkillGrouping(skills))

    expect(result.current.groups.frontend).toHaveLength(2)
    expect(result.current.groups.backend).toHaveLength(1)
    expect(result.current.groups.languages).toHaveLength(1)
  })

  test("should put null-category skills in 'general' group", () => {
    const { result } = renderHook(() => useSkillGrouping(skills))

    expect(result.current.groups.general).toHaveLength(1)
    expect(result.current.groups.general[0].name).toBe("Unknown")
  })

  test("should return category order", () => {
    const { result } = renderHook(() => useSkillGrouping(skills))
    expect(result.current.categoryOrder).toEqual([...CATEGORY_ORDER])
    expect(result.current.categoryOrder).toContain("frontend")
    expect(result.current.categoryOrder).toContain("backend")
  })

  test("should return category labels", () => {
    const { result } = renderHook(() => useSkillGrouping(skills))
    expect(result.current.categoryLabels).toBe(CATEGORY_LABELS)
    expect(result.current.categoryLabels.frontend).toBe("Frontend")
    expect(result.current.categoryLabels.data_ai).toBe("Data & AI")
  })

  test("should handle empty skills array", () => {
    const { result } = renderHook(() => useSkillGrouping([]))
    expect(Object.keys(result.current.groups)).toHaveLength(0)
  })
})

describe("CATEGORY_ORDER", () => {
  test("should have 17 categories", () => {
    expect(CATEGORY_ORDER).toHaveLength(17)
  })

  test("should start with frontend", () => {
    expect(CATEGORY_ORDER[0]).toBe("frontend")
  })

  test("should end with general", () => {
    expect(CATEGORY_ORDER[CATEGORY_ORDER.length - 1]).toBe("general")
  })
})

describe("CATEGORY_LABELS", () => {
  test("should have labels for all categories in order", () => {
    for (const cat of CATEGORY_ORDER) {
      expect(CATEGORY_LABELS[cat]).toBeDefined()
    }
  })
})
