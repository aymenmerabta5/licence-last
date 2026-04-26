import type { LucideIcon } from "lucide-react"
import { Building2, Megaphone, UserCheck, Zap } from "lucide-react"
import * as motion from "motion/react-client"
import type { ForCompaniesSectionProps } from "@/app/[locale]/for-companies/_components/ForCompaniesContent/types"
import { Separator } from "@/components/ui/separator"
import { ease, reveal } from "@/lib/animations"

const WORKFLOW: Array<{ key: string; icon: LucideIcon }> = [
  { key: "step1", icon: Building2 },
  { key: "step2", icon: Megaphone },
  { key: "step3", icon: UserCheck },
  { key: "step4", icon: Zap },
]

const STATS = ["students", "placement", "universities", "avgTime"] as const

export function ForCompaniesWorkflowStatsSection({
  t,
}: ForCompaniesSectionProps) {
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
              {t("workflow.label")}
            </span>
            <Separator className="flex-1 bg-border/50" />
          </motion.div>

          <motion.h2
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="mb-16 font-serif text-heading"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {t("workflow.headline")}
          </motion.h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW.map((step, index) => (
              <motion.div
                key={step.key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.3 + index * 0.12 }}
                className="relative"
              >
                {index < WORKFLOW.length - 1 && (
                  <div className="absolute top-6 start-[calc(50%+24px)] end-[calc(-50%+24px)] hidden h-px bg-border lg:block" />
                )}

                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/30 bg-background">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="mb-2 font-serif text-xs font-bold tracking-[0.2em] uppercase text-primary/60 [[dir=rtl]_&]:tracking-normal">
                    {t(`workflow.${step.key}.num`)}
                  </span>
                  <h3 className="mb-2 font-serif text-lg text-heading">
                    {t(`workflow.${step.key}.title`)}
                  </h3>
                  <p className="max-w-48 text-sm leading-relaxed text-muted-foreground">
                    {t(`workflow.${step.key}.desc`)}
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
