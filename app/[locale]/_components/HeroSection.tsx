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

/* ── Shared reveal transition ── */
const reveal = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

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
          <span className="font-serif text-4xl font-normal text-primary ed-card-num transition-colors duration-400 group-hover/card:text-secondary-foreground dark:group-hover/card:text-primary-foreground">
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
    <section className="relative px-8 lg:px-16 pt-16 pb-20">
      {/* Subtle warm glow — only visible in dark mode */}
      <div
        className="ed-hero-glow absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl grid lg:grid-cols-12 gap-12 items-start">
        {/* ── Left column — 7 cols ── */}
        <div className="lg:col-span-7">
          {/* Issue marker */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center gap-3 mb-8"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
              {t("hero.volume")}
            </span>
            <Separator className="flex-1 bg-border/50 ed-smooth" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
            className="font-serif text-heading ed-smooth"
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
                <span className="relative inline-block ed-underline text-primary">
                  {headlineHighlight}
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
            className="mt-10 grid grid-cols-2 gap-8 border-t border-border pt-8 ed-smooth"
          >
            <p className="text-sm leading-relaxed font-light text-muted-foreground ed-smooth">
              {t("hero.description1")}
            </p>
            <p className="text-sm leading-relaxed font-light text-muted-foreground ed-smooth">
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
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
            </Button>
            <Separator
              orientation="vertical"
              className="h-5 bg-foreground/20 dark:bg-foreground/15 ed-smooth"
            />
            <span className="text-xs tracking-wide text-foreground/40 dark:text-foreground/35 ed-smooth">
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
