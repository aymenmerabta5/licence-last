import * as motion from "motion/react-client"
import type { AboutSectionProps } from "@/app/[locale]/about/_components/AboutContent/types"
import { Separator } from "@/components/ui/separator"
import { ease, reveal } from "@/lib/animations"

export function AboutHeroMissionSection({ t }: AboutSectionProps) {
  const headline = t("hero.headline")
  const highlight = t("hero.headlineHighlight")
  const idx = highlight.length > 0 ? headline.indexOf(highlight) : -1
  const hasHighlight = idx !== -1

  return (
    <>
      <section className="relative px-4 sm:px-6 lg:px-16 pt-20 pb-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100"
          aria-hidden="true"
        >
          <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-primary/4 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-8 flex items-center gap-3"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("hero.kicker")}
            </span>
            <Separator className="flex-1 bg-border/50" />
          </motion.div>

          <motion.h1
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
            className="max-w-4xl font-serif text-heading"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 5rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            {hasHighlight ? (
              <>
                {headline.slice(0, idx)}
                <span className="relative inline-block text-primary">
                  {highlight}
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, ease, delay: 0.55 }}
                    className="pointer-events-none absolute -bottom-1 start-0 end-0 h-[3px] origin-left bg-primary [[dir=rtl]_&]:origin-right"
                    aria-hidden="true"
                  />
                </span>
                {headline.slice(idx + highlight.length)}
              </>
            ) : (
              headline
            )}
          </motion.h1>

          <motion.p
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.24 }}
            className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          >
            {t("hero.description")}
          </motion.p>
        </div>
      </section>

      <section className="border-t border-border px-4 sm:px-6 lg:px-16 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <motion.div
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mb-6 flex items-center gap-3"
            >
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
                {t("mission.label")}
              </span>
              <Separator className="flex-1 bg-border/50" />
            </motion.div>
            <motion.h2
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="sticky top-8 font-serif text-heading"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {t("mission.headline")}
            </motion.h2>
          </div>

          <div className="flex flex-col gap-8 lg:col-span-8">
            {(["p1", "p2", "p3"] as const).map((key, index) => (
              <motion.p
                key={key}
                {...reveal}
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                  delay: 0.2 + index * 0.1,
                }}
                className="text-lg leading-relaxed text-muted-foreground"
              >
                {t(`mission.paragraphs.${key}`)}
              </motion.p>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
