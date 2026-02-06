"use client"

import { useEffect, useState } from "react"

import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const t = useTranslations("theme.toggle")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="editorial-ghost"
        size="editorial-icon"
        className="ed-toggle"
        aria-label={t("aria")}
      >
        <span className="ed-toggle-icon">
          <span className="h-4 w-4" />
        </span>
      </Button>
    )
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="editorial-ghost"
      size="editorial-icon"
      className="ed-toggle"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("toLight") : t("toDark")}
    >
      <span className="ed-toggle-icon">
        {isDark ? (
          <Sun className="h-4 w-4 text-primary" />
        ) : (
          <Moon className="h-4 w-4 text-muted-foreground" />
        )}
      </span>
    </Button>
  )
}
