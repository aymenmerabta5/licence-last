"use client"

import { useRef, useEffect, useCallback } from "react"

/**
 * Attaches an IntersectionObserver to a sentinel element to trigger
 * infinite scroll pagination. Returns a ref to attach to the sentinel div.
 *
 * @example
 * const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage)
 * // ...
 * <div ref={sentinelRef} />
 */
export function useInfiniteScroll(
  fetchNextPage: () => void,
  hasNextPage: boolean | undefined,
  isFetchingNextPage?: boolean,
) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "200px",
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleIntersection])

  return sentinelRef
}
