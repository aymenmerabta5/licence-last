"use client"

import { Moon, Sun } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { NAVBAR_ICON_CONTROL_CLASS } from "@/components/navbar-control-styles"
import { Button } from "@/components/ui/button"

const emptySubscribe = () => () => {}

export function ThemeToggle() {
  const t = useTranslations("theme.toggle")
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-lg"
        className={`${NAVBAR_ICON_CONTROL_CLASS} opacity-0`}
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={NAVBAR_ICON_CONTROL_CLASS}
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
        <Moon className="h-5 w-5 text-current opacity-80" />
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
        <Sun className="h-5 w-5 text-current opacity-80" />
      </motion.div>
    </Button>
  )
}
