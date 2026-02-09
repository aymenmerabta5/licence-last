"use client"

import { useSyncExternalStore } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import * as motion from "motion/react-client"

const emptySubscribe = () => () => {}

export function ThemeToggle() {
  const t = useTranslations("theme.toggle")
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

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
      className="relative h-10 w-10 rounded-full hover:bg-secondary/80 transition-all group overflow-hidden"
      aria-label={isDark ? t("toLight") : t("toDark")}
    >
      <motion.div
        initial={false}
        animate={{
          y: isDark ? 0 : -30,
          opacity: isDark ? 1 : 0,
          rotate: isDark ? 0 : 45,
        }}
        className="absolute inset-0 flex items-center justify-center"
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Moon className="h-5 w-5 text-primary" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          y: isDark ? 30 : 0,
          opacity: isDark ? 0 : 1,
          rotate: isDark ? -45 : 0,
        }}
        className="absolute inset-0 flex items-center justify-center"
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Sun className="h-5 w-5 text-orange-500" />
      </motion.div>
    </button>
  )
}
