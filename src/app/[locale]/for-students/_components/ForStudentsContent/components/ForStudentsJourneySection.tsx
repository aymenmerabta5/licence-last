import type { LucideIcon } from "lucide-react"
import { CheckCircle2, Palette, Search, UserPlus } from "lucide-react"
import * as motion from "motion/react-client"
import { Separator } from "@/components/ui/separator"
import { ease, reveal } from "@/lib/animations"
import type { ForStudentsSectionProps } from "@/app/[locale]/for-students/_components/ForStudentsContent/types"

const JOURNEY: Array<{ key: string; icon: LucideIcon }> = [
  { key: "step1", icon: UserPlus },
  { key: "step2", icon: Palette },
  { key: "step3", icon: Search },
  { key: "step4", icon: CheckCircle2 },
]

export function ForStudentsJourneySection({ t }: ForStudentsSectionProps) {
  return (
    <section className="border-t border-border px-8 lg:px-16 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          {...reveal}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
            {t("journey.label")}
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
          {t("journey.headline")}
        </motion.h2>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 lg:grid-cols-4">
          {JOURNEY.map((step, index) => (
            <motion.div
              key={step.key}
              {...reveal}
              transition={{ duration: 0.6, ease, delay: 0.3 + index * 0.12 }}
              className="relative flex flex-col items-center px-6 pb-8 text-center"
            >
              {index < JOURNEY.length - 1 && (
                <div className="absolute top-6 start-[calc(50%+24px)] end-[calc(-50%+24px)] hidden h-px bg-border lg:block" />
              )}

              <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/30 bg-background">
                <step.icon className="h-5 w-5 text-primary" />
              </div>

              <span className="mb-2 font-serif text-xs font-bold tracking-[0.2em] uppercase text-primary/60 [[dir=rtl]_&]:tracking-normal">
                {t(`journey.${step.key}.num`)}
              </span>
              <h3 className="mb-2 font-serif text-lg text-heading">
                {t(`journey.${step.key}.title`)}
              </h3>
              <p className="max-w-48 text-sm leading-relaxed text-muted-foreground">
                {t(`journey.${step.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
