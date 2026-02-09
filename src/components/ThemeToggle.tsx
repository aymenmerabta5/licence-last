"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import * as motion from "motion/react-client"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const t = useTranslations("theme.toggle")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="p-2.5 rounded-full hover:bg-secondary transition-colors opacity-0">
        <Sun className="h-4 w-4" />
      </button>
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative p-2.5 rounded-full hover:bg-secondary/80 transition-all group overflow-hidden"
      aria-label={isDark ? t("toLight") : t("toDark")}
    >
      <motion.div
        initial={false}
        animate={{ 
          y: isDark ? 0 : 40,
          rotate: isDark ? 0 : 45
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Moon className="h-5 w-5 text-primary" />
      </motion.div>
      
      <motion.div
        initial={false}
        animate={{ 
          y: isDark ? -40 : -20,
          rotate: isDark ? -45 : 0
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Sun className="h-5 w-5 text-orange-500" />
      </motion.div>
    </button>
  )
}
