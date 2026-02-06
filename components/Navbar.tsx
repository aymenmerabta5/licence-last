import { useTranslations } from "next-intl"

import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const t = useTranslations("nav")

  const navItems = [
    t("discover"),
    t("forStudents"),
    t("forRecruiters"),
    t("about"),
  ]

  return (
    <nav
      className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6 border-b border-border ed-smooth"
      aria-label={t("aria.mainNav")}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3">
        <span className="font-serif text-2xl tracking-tight text-heading ed-smooth">
          Internex<span className="text-primary">.</span>io
        </span>
      </div>

      {/* ── Nav Links ── */}
      <div className="hidden md:flex items-center gap-10">
        {navItems.map((item) => (
          <span
            key={item}
            className="relative text-sm font-medium tracking-wide cursor-pointer text-foreground/45 hover:text-primary transition-colors duration-300"
          >
            {item}
          </span>
        ))}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <Button
          variant="editorial"
          size="editorial-sm"
          aria-label={t("aria.getStarted")}
        >
          {t("getStarted")}
        </Button>
      </div>
    </nav>
  )
}