"use client"

import * as React from "react"
import { usePathname } from "@/i18n/routing"

export function RouteProgress() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = React.useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — clear progress when route changes
  React.useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")
      if (!anchor) return

      const href = anchor.getAttribute("href")
      if (!href) return
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:")
      )
        return
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return

      setIsNavigating(true)
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  return (
    <div
      className={`fixed top-0 inset-x-0 z-[100] h-[2px] bg-primary transition-opacity duration-300 ${isNavigating ? "opacity-100" : "opacity-0"}`}
      style={{
        background:
          "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, hsl(var(--primary)/0.6) 80%, transparent 100%)",
        transform: isNavigating ? "translateX(0)" : "translateX(-100%)",
        transition: isNavigating
          ? "transform 10s cubic-bezier(0.1, 0.5, 0.3, 1), opacity 0.3s"
          : "transform 0.4s ease-in, opacity 0.3s 0.1s",
      }}
    />
  )
}
