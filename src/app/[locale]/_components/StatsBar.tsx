import { cn } from "@/lib/utils"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

export function StatsBar() {
  const t = useTranslations("stats")

  const stats = [
    { value: t("placementRate.value"), label: t("placementRate.label") },
    { value: t("universities.value"), label: t("universities.label") },
    { value: t("students.value"), label: t("students.label") },
    { value: t("companies.value"), label: t("companies.label") },
  ]

  return (
    <section className="px-5 sm:px-8 lg:px-16 pb-16 sm:pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
        className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-0 rounded-3xl border border-border/60 bg-background shadow-[0_4px_40px_-12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_40px_-12px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-500"
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className={cn(
              "relative flex flex-col items-center justify-center py-10 sm:py-12 px-4 sm:px-6 text-center transition-all duration-500 group hover:bg-primary/5",
              // Mobile 2-col: left-column items get end border
              i % 2 === 0 && "border-e border-border/60",
              // Mobile 2-col: first-row items get bottom border
              i < 2 && "border-b border-border/60 md:border-b-0",
              // Desktop 4-col: all-but-last get end border; last has none
              i < stats.length - 1 ? "md:border-e md:border-border/60" : "md:border-e-0",
            )}
          >
            <div className="font-serif text-4xl sm:text-5xl mb-2 text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] drop-shadow-sm">
              {stat.value}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-foreground/40 dark:text-foreground/40 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] [[dir=rtl]_&]:tracking-normal">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
