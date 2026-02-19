import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"

export function StatsBar() {
  const t = useTranslations("stats")

  const stats = [
    { value: t("students.value"), label: t("students.label") },
    { value: t("companies.value"), label: t("companies.label") },
    { value: t("universities.value"), label: t("universities.label") },
    { value: t("placementRate.value"), label: t("placementRate.label") },
  ]

  return (
    <section className="px-8 lg:px-16 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
        className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-0 border-y-2 border-foreground dark:border-foreground/15 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className="py-8 px-6 text-center transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              borderInlineEnd:
                i < stats.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div className="font-serif text-4xl mb-1 text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
              {stat.value}
            </div>
            <div className="text-xs font-medium uppercase tracking-[0.15em] text-foreground/35 dark:text-foreground/30 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] [[dir=rtl]_&]:tracking-normal">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
