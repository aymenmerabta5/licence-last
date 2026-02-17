import { describe, test, expect, beforeEach } from "bun:test"
import { renderHook, act } from "@testing-library/react"

import { useDebounce } from "@/hooks/useDebounce"

describe("useDebounce", () => {
  beforeEach(() => {
    // Use fake timers so we can control setTimeout
    // bun:test doesn't have jest.useFakeTimers, so we test with real timers + waitFor
  })

  test("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300))
    expect(result.current).toBe("hello")
  })

  test("should not update value before delay", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } },
    )

    expect(result.current).toBe("initial")

    rerender({ value: "updated", delay: 500 })

    // Value should still be initial immediately after rerender
    expect(result.current).toBe("initial")
  })

  test("should update value after delay", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 50 } },
    )

    rerender({ value: "updated", delay: 50 })

    // Wait for the debounce to fire
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    expect(result.current).toBe("updated")
  })

  test("should only emit the last value on rapid changes", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "first", delay: 50 } },
    )

    rerender({ value: "second", delay: 50 })
    rerender({ value: "third", delay: 50 })
    rerender({ value: "fourth", delay: 50 })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
    })

    expect(result.current).toBe("fourth")
  })
})
