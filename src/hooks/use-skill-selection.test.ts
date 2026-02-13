import { describe, test, expect } from "bun:test"
import { renderHook, act } from "@testing-library/react"

import { useSkillSelection } from "./use-skill-selection"

describe("useSkillSelection", () => {
  test("should start with empty selection", () => {
    const { result } = renderHook(() => useSkillSelection())
    expect(result.current.selectedIds).toEqual([])
    expect(result.current.count).toBe(0)
    expect(result.current.isAtMax).toBe(false)
  })

  test("should add a skill when toggled", () => {
    const { result } = renderHook(() => useSkillSelection())

    act(() => { result.current.toggle("skill-1") })

    expect(result.current.selectedIds).toEqual(["skill-1"])
    expect(result.current.count).toBe(1)
    expect(result.current.isSelected("skill-1")).toBe(true)
  })

  test("should remove a skill when toggled twice", () => {
    const { result } = renderHook(() => useSkillSelection())

    act(() => { result.current.toggle("skill-1") })
    act(() => { result.current.toggle("skill-1") })

    expect(result.current.selectedIds).toEqual([])
    expect(result.current.isSelected("skill-1")).toBe(false)
  })

  test("should enforce maxSelections limit", () => {
    const { result } = renderHook(() => useSkillSelection(2))

    act(() => { result.current.toggle("skill-1") })
    act(() => { result.current.toggle("skill-2") })

    expect(result.current.isAtMax).toBe(true)

    // Trying to add a third should be ignored
    act(() => { result.current.toggle("skill-3") })

    expect(result.current.count).toBe(2)
    expect(result.current.isSelected("skill-3")).toBe(false)
  })

  test("should allow adding after removing when at max", () => {
    const { result } = renderHook(() => useSkillSelection(2))

    act(() => { result.current.toggle("skill-1") })
    act(() => { result.current.toggle("skill-2") })
    act(() => { result.current.toggle("skill-1") }) // remove
    act(() => { result.current.toggle("skill-3") }) // add new

    expect(result.current.selectedIds).toEqual(["skill-2", "skill-3"])
  })

  test("should reset all selections", () => {
    const { result } = renderHook(() => useSkillSelection())

    act(() => { result.current.toggle("skill-1") })
    act(() => { result.current.toggle("skill-2") })
    act(() => { result.current.reset() })

    expect(result.current.selectedIds).toEqual([])
    expect(result.current.count).toBe(0)
  })

  test("should set selections directly", () => {
    const { result } = renderHook(() => useSkillSelection())

    act(() => { result.current.setSelectedIds(["a", "b", "c"]) })

    expect(result.current.selectedIds).toEqual(["a", "b", "c"])
    expect(result.current.count).toBe(3)
  })

  test("should expose maxSelections", () => {
    const { result } = renderHook(() => useSkillSelection(5))
    expect(result.current.maxSelections).toBe(5)
  })

  test("should default maxSelections to 10", () => {
    const { result } = renderHook(() => useSkillSelection())
    expect(result.current.maxSelections).toBe(10)
  })
})
