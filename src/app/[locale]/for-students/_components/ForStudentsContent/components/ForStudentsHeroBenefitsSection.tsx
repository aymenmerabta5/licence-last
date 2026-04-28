import type { LucideIcon } from "lucide-react"
import {
  Activity,
  ArrowRight,
  Bot,
  FileText,
  MousePointerClick,
  ScrollText,
  Sparkles,
} from "lucide-react"
import * as motion from "motion/react-client"
import type { ForStudentsSectionProps } from "@/app/[locale]/for-students/_components/ForStudentsContent/types"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

const BENEFITS: Array<{ key: string; icon: LucideIcon }> = [
  { key: "cv", icon: FileText },
  { key: "matching", icon: Sparkles },
  { key: "apply", icon: MousePointerClick },
  { key: "tracking", icon: Activity },
  { key: "assistant", icon: Bot },
  { key: "documents", icon: ScrollText },
]

export function ForStudentsHeroBenefitsSection({ t }: ForStudentsSectionProps) {
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
          <div className="absolute -top-24 end-0 h-96 w-96 rounded-full bg-primary/6 blur-3xl" />
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

          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.36 }}
            className="mt-10 flex items-center gap-6"
          >
            <Button
              variant="editorial"
              size="editorial"
              className="group"
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              {t("cta.button")}
              <ArrowRight className="ms-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 [[dir=rtl]_&]:group-hover:-translate-x-1" />
            </Button>
            <Separator
              orientation="vertical"
              className="h-5 bg-foreground/20 dark:bg-foreground/15"
            />
            <span className="text-xs tracking-wide text-foreground/40 [[dir=rtl]_&]:tracking-normal">
              {t("cta.free")}
            </span>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border px-4 sm:px-6 lg:px-16 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("benefits.label")}
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
            {t("benefits.headline")}
          </motion.h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit, index) => (
              <motion.div
                key={benefit.key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.2 + index * 0.08 }}
                className="group flex gap-4 border border-border p-6 transition-colors duration-300 hover:border-primary/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-1 font-serif text-lg text-heading">
                    {t(`benefits.${benefit.key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`benefits.${benefit.key}.desc`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
