import type { LucideIcon } from "lucide-react"
import { Briefcase, GraduationCap, Sun, Wrench } from "lucide-react"
import * as motion from "motion/react-client"
import type { DiscoverSectionProps } from "@/app/[locale]/discover/_components/DiscoverContent/types"
import { Separator } from "@/components/ui/separator"
import { ease, reveal } from "@/lib/animations"

const MATCH_WEIGHTS = [
  { key: "skills", width: "55%", color: "bg-primary" },
  { key: "language", width: "20%", color: "bg-chart-2" },
  { key: "location", width: "15%", color: "bg-chart-3" },
  { key: "profile", width: "10%", color: "bg-chart-4" },
]

const TYPES: Array<{ key: string; icon: LucideIcon }> = [
  { key: "pfe", icon: GraduationCap },
  { key: "immersion", icon: Briefcase },
  { key: "summer", icon: Sun },
  { key: "practical", icon: Wrench },
]

export function DiscoverMatchingTypesSection({ t }: DiscoverSectionProps) {
  return (
    <>
      <section className="border-t border-border px-8 lg:px-16 py-20">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <motion.div
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mb-6 flex items-center gap-3"
            >
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
                {t("matching.label")}
              </span>
              <Separator className="flex-1 bg-border/50" />
            </motion.div>
            <motion.h2
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="font-serif text-heading"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {t("matching.headline")}
            </motion.h2>
            <motion.p
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="mt-6 leading-relaxed text-muted-foreground"
            >
              {t("matching.description")}
            </motion.p>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-7">
            {MATCH_WEIGHTS.map((weight, index) => (
              <motion.div
                key={weight.key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.3 + index * 0.1 }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold tracking-wide text-heading">
                    {t(`matching.${weight.key}.label`)}
                  </span>
                  <span className="font-serif text-2xl text-primary">
                    {t(`matching.${weight.key}.value`)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: weight.width }}
                    transition={{
                      duration: 1,
                      ease,
                      delay: 0.5 + index * 0.15,
                    }}
                    className={`h-full rounded-full ${weight.color}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(`matching.${weight.key}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-8 lg:px-16 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("types.label")}
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
            {t("types.headline")}
          </motion.h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TYPES.map((type, index) => (
              <motion.div
                key={type.key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.2 + index * 0.1 }}
                className="group relative border-2 border-border p-8 transition-all duration-300 hover:border-primary"
              >
                <type.icon className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-serif text-xl text-heading">
                  {t(`types.${type.key}.title`)}
                </h3>
                <p className="mb-3 text-xs font-bold tracking-[0.15em] uppercase text-primary/60 [[dir=rtl]_&]:tracking-normal">
                  {t(`types.${type.key}.fullTitle`)}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`types.${type.key}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
