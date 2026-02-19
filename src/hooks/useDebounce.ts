"use client"

import { useEffect, useState } from "react"

/**
 * Debounces a value by the specified delay in milliseconds.
 *
 * @example
 * const [keyword, setKeyword] = useState("")
 * const debouncedKeyword = useDebounce(keyword, 300)
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
