import * as motion from "motion/react-client"
import { ArrowRight, GraduationCap, Building2, TrendingUp } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardHeader,
  CardAction,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { reveal, ease } from "@/lib/animations"

/* ── Individual Feature Card ── */
function FeatureCard({
  num,
  title,
  desc,
  icon: Icon,
  index,
}: {
  num: string
  title: string
  desc: string
  icon: LucideIcon
  index: number
}) {
  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease, delay: 0.4 + index * 0.12 }}
    >
      <Card variant="editorial">
        <CardHeader>
          <span className="font-serif text-4xl font-normal text-primary transition-colors duration-[400ms] dark:drop-shadow-[0_0_18px_var(--color-primary)] group-hover/card:text-secondary-foreground dark:group-hover/card:text-primary-foreground">
            {num}
          </span>
          <CardAction>
            <Icon className="h-5 w-5 opacity-30" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardTitle className="mb-2">{title}</CardTitle>
          <CardDescription>{desc}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ── Hero Section ── */
export function HeroSection() {
  const t = useTranslations()

  const headline = t("hero.headline")
  const headlineHighlight = t("hero.headlineHighlight")
  const highlightIndex =
    headlineHighlight.trim().length > 0
      ? headline.indexOf(headlineHighlight)
      : -1
  const hasHighlight = highlightIndex !== -1
  const headlineBefore = hasHighlight
    ? headline.slice(0, highlightIndex)
    : headline
  const headlineAfter = hasHighlight
    ? headline.slice(highlightIndex + headlineHighlight.length)
    : ""

  const features = [
    {
      num: t("features.studentSpace.num"),
      title: t("features.studentSpace.title"),
      desc: t("features.studentSpace.desc"),
      icon: GraduationCap,
    },
    {
      num: t("features.companyPortal.num"),
      title: t("features.companyPortal.title"),
      desc: t("features.companyPortal.desc"),
      icon: Building2,
    },
    {
      num: t("features.adminDashboard.num"),
      title: t("features.adminDashboard.title"),
      desc: t("features.adminDashboard.desc"),
      icon: TrendingUp,
    },
  ]

  return (
    <section id="discover" className="relative px-8 lg:px-16 pt-16 pb-20">
      {/* Subtle warm glow — only visible in dark mode */}
      <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100" aria-hidden="true">
        <div className="absolute -top-24 -start-24 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-32 start-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl grid lg:grid-cols-12 gap-12 items-start">
        {/* ── Left column — 7 cols ── */}
        <div className="lg:col-span-7">
          {/* Issue marker */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center gap-3 mb-8"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("hero.volume")}
            </span>
            <Separator className="flex-1 bg-border/50 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
            className="font-serif text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              fontSize: "clamp(3rem, 6vw, 5.5rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            {hasHighlight ? (
              <>
                {headlineBefore}
                <span className="relative inline-block text-primary">
                  {headlineHighlight}
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, ease, delay: 0.55 }}
                    className="pointer-events-none absolute -bottom-1 start-0 end-0 h-[3px] bg-primary origin-left [[dir=rtl]_&]:origin-right"
                    aria-hidden="true"
                  />
                </span>
                {headlineAfter}
              </>
            ) : (
              headline
            )}
          </motion.h1>

          {/* Description columns */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.24 }}
            className="mt-10 grid grid-cols-2 gap-8 border-t border-border pt-8 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          >
            <p className="text-sm leading-relaxed font-light text-muted-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
              {t("hero.description1")}
            </p>
            <p className="text-sm leading-relaxed font-light text-muted-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
              {t("hero.description2")}
            </p>
          </motion.div>

          {/* CTA row */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.36 }}
            className="mt-10 flex items-center gap-6"
          >
            <Button
              variant="editorial-link"
              size="editorial-sm"
              className="group"
              aria-label={t("hero.aria.explore")}
            >
              {t("hero.cta")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2 [[dir=rtl]_&]:group-hover:-translate-x-2" />
            </Button>
            <Separator
              orientation="vertical"
              className="h-5 bg-foreground/20 dark:bg-foreground/15 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            />
            <span className="text-xs tracking-wide text-foreground/40 dark:text-foreground/35 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] [[dir=rtl]_&]:tracking-normal">
              {t("hero.freeForStudents")}
            </span>
          </motion.div>
        </div>

        {/* ── Right column — 5 cols, staggered editorial cards ── */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {features.map((item, i) => (
            <FeatureCard key={i} index={i} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}
