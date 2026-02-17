import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import {
  Sparkles,
  Search,
  Bot,
  FileText,
  ScrollText,
  Activity,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Sun,
  Wrench,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
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
import { Link } from "@/i18n/routing"
import { reveal, ease } from "@/lib/animations"
import { MarqueeRibbon } from "@/app/[locale]/_components/MarqueeRibbon"
import { Metadata } from "next"

type Params = Promise<{ locale: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "pages.discover" })
  return { title: t("metadata.title"), description: t("metadata.description") }
}

export default async function DiscoverPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <Navbar />
      <MarqueeRibbon />
      <DiscoverContent />
      <Footer />
    </main>
  )
}

/* ── All sections ── */
function DiscoverContent() {
  const t = useTranslations("pages.discover")

  const headline = t("hero.headline")
  const highlight = t("hero.headlineHighlight")
  const idx = highlight.length > 0 ? headline.indexOf(highlight) : -1
  const hasHighlight = idx !== -1

  const features: Array<{ key: string; icon: LucideIcon }> = [
    { key: "matching", icon: Sparkles },
    { key: "search", icon: Search },
    { key: "assistant", icon: Bot },
    { key: "cv", icon: FileText },
    { key: "documents", icon: ScrollText },
    { key: "tracking", icon: Activity },
  ]

  const matchWeights = [
    { key: "skills", width: "55%", color: "bg-primary" },
    { key: "language", width: "20%", color: "bg-chart-2" },
    { key: "location", width: "15%", color: "bg-chart-3" },
    { key: "profile", width: "10%", color: "bg-chart-4" },
  ]

  const types: Array<{ key: string; icon: LucideIcon }> = [
    { key: "pfe", icon: GraduationCap },
    { key: "immersion", icon: Briefcase },
    { key: "summer", icon: Sun },
    { key: "practical", icon: Wrench },
  ]

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative px-8 lg:px-16 pt-20 pb-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100"
          aria-hidden="true"
        >
          <div className="absolute -top-24 -start-24 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center gap-3 mb-8"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("hero.kicker")}
            </span>
            <Separator className="flex-1 bg-border/50" />
          </motion.div>

          <motion.h1
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
            className="font-serif text-heading max-w-4xl"
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
                    className="pointer-events-none absolute -bottom-1 start-0 end-0 h-[3px] bg-primary origin-left [[dir=rtl]_&]:origin-right"
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

      {/* ── Features Grid ── */}
      <section className="px-8 lg:px-16 py-20 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("features.label")}
            </span>
            <Separator className="flex-1 bg-border/50" />
          </motion.div>

          <motion.h2
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="font-serif text-heading mb-12"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {t("features.headline")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.2 + i * 0.08 }}
              >
                <Card variant="editorial">
                  <CardHeader>
                    <span className="font-serif text-4xl font-normal text-primary transition-colors duration-[400ms] dark:drop-shadow-[0_0_18px_var(--color-primary)] group-hover/card:text-secondary-foreground dark:group-hover/card:text-primary-foreground">
                      {t(`features.items.${f.key}.num`)}
                    </span>
                    <CardAction>
                      <f.icon className="h-5 w-5 opacity-30" />
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="mb-2">
                      {t(`features.items.${f.key}.title`)}
                    </CardTitle>
                    <CardDescription>
                      {t(`features.items.${f.key}.desc`)}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Matching Algorithm ── */}
      <section className="px-8 lg:px-16 py-20 border-t border-border">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <motion.div
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex items-center gap-3 mb-6"
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
              className="mt-6 text-muted-foreground leading-relaxed"
            >
              {t("matching.description")}
            </motion.p>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-8">
            {matchWeights.map((w, i) => (
              <motion.div
                key={w.key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.3 + i * 0.1 }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold tracking-wide text-heading">
                    {t(`matching.${w.key}.label`)}
                  </span>
                  <span className="font-serif text-2xl text-primary">
                    {t(`matching.${w.key}.value`)}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: w.width }}
                    transition={{ duration: 1, ease, delay: 0.5 + i * 0.15 }}
                    className={`h-full ${w.color} rounded-full`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(`matching.${w.key}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Internship Types ── */}
      <section className="px-8 lg:px-16 py-20 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("types.label")}
            </span>
            <Separator className="flex-1 bg-border/50" />
          </motion.div>

          <motion.h2
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="font-serif text-heading mb-12"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {t("types.headline")}
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {types.map((type, i) => (
              <motion.div
                key={type.key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.2 + i * 0.1 }}
                className="group relative border-2 border-border hover:border-primary p-8 transition-all duration-300"
              >
                <type.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-serif text-xl text-heading mb-1">
                  {t(`types.${type.key}.title`)}
                </h3>
                <p className="text-xs font-bold tracking-[0.15em] uppercase text-primary/60 mb-3 [[dir=rtl]_&]:tracking-normal">
                  {t(`types.${type.key}.fullTitle`)}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`types.${type.key}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-8 lg:px-16 py-20 border-t border-border">
        <motion.div
          {...reveal}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-center gap-8"
        >
          <div className="text-center sm:text-start">
            <h2 className="font-serif text-2xl text-heading">
              {t("cta.headline")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("cta.description")}</p>
          </div>
          <Separator
            orientation="vertical"
            className="hidden sm:block h-12 bg-border/50"
          />
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
        </motion.div>
      </section>
    </>
  )
}
