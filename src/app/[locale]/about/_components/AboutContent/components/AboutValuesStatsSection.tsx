import type { LucideIcon } from "lucide-react"
import { Eye, Globe, Lightbulb, Shield } from "lucide-react"
import * as motion from "motion/react-client"
import { Separator } from "@/components/ui/separator"
import { ease, reveal } from "@/lib/animations"
import type { AboutSectionProps } from "@/app/[locale]/about/_components/AboutContent/types"

const VALUES: Array<{ key: string; icon: LucideIcon }> = [
  { key: "innovation", icon: Lightbulb },
  { key: "accessibility", icon: Globe },
  { key: "transparency", icon: Eye },
  { key: "reliability", icon: Shield },
]

const STATS = ["students", "companies", "universities", "placement"] as const

export function AboutValuesStatsSection({ t }: AboutSectionProps) {
  return (
    <>
      <section className="border-t border-border px-8 lg:px-16 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("values.label")}
            </span>
            <Separator className="flex-1 bg-border/50" />
          </motion.div>

          <motion.h2
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="mb-12 font-serif text-heading"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {t("values.headline")}
          </motion.h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {VALUES.map((value, index) => (
              <motion.div
                key={value.key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.2 + index * 0.1 }}
                className="group flex gap-5 border-2 border-border p-8 transition-colors duration-300 hover:border-primary"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-background text-primary transition-all group-hover:border-primary group-hover:bg-primary/5">
                  <value.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-2 font-serif text-xl text-heading">
                    {t(`values.${value.key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`values.${value.key}.desc`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-8 lg:px-16 py-20">
        <motion.div
          {...reveal}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-6xl"
        >
          <div className="mb-10 flex items-center gap-3">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("stats.label")}
            </span>
            <Separator className="flex-1 bg-border/50" />
          </div>

          <div className="grid grid-cols-2 gap-0 border-y-2 border-foreground md:grid-cols-4 dark:border-foreground/15">
            {STATS.map((key, index) => (
              <motion.div
                key={key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.2 + index * 0.1 }}
                className="px-6 py-8 text-center"
                style={{
                  borderInlineEnd:
                    index < STATS.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                }}
              >
                <div className="mb-1 font-serif text-4xl text-heading">
                  {t(`stats.${key}.value`)}
                </div>
                <div className="text-xs font-medium tracking-[0.15em] uppercase text-foreground/35 [[dir=rtl]_&]:tracking-normal">
                  {t(`stats.${key}.label`)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </>
  )
}
