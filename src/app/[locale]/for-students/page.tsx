import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import {
  FileText,
  Sparkles,
  MousePointerClick,
  Activity,
  Bot,
  ScrollText,
  UserPlus,
  Palette,
  Search,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"
import { reveal, ease } from "@/lib/animations"
import { MarqueeRibbon } from "../_components/MarqueeRibbon"
import { Metadata } from "next"

type Params = Promise<{ locale: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "pages.forStudents" })
  return { title: t("metadata.title"), description: t("metadata.description") }
}

export default async function ForStudentsPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <Navbar />
      <MarqueeRibbon />
      <ForStudentsContent />
      <Footer />
    </main>
  )
}

function ForStudentsContent() {
  const t = useTranslations("pages.forStudents")

  const headline = t("hero.headline")
  const highlight = t("hero.headlineHighlight")
  const idx = highlight.length > 0 ? headline.indexOf(highlight) : -1
  const hasHighlight = idx !== -1

  const benefits: Array<{ key: string; icon: LucideIcon }> = [
    { key: "cv", icon: FileText },
    { key: "matching", icon: Sparkles },
    { key: "apply", icon: MousePointerClick },
    { key: "tracking", icon: Activity },
    { key: "assistant", icon: Bot },
    { key: "documents", icon: ScrollText },
  ]

  const journey: Array<{ key: string; icon: LucideIcon }> = [
    { key: "step1", icon: UserPlus },
    { key: "step2", icon: Palette },
    { key: "step3", icon: Search },
    { key: "step4", icon: CheckCircle2 },
  ]

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative px-8 lg:px-16 pt-20 pb-24">
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

      {/* ── Benefits Grid ── */}
      <section className="px-8 lg:px-16 py-20 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("benefits.label")}
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
            {t("benefits.headline")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <motion.div
                key={b.key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.2 + i * 0.08 }}
                className="group flex gap-4 p-6 border border-border hover:border-primary/40 transition-colors duration-300"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <b.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-heading mb-1">
                    {t(`benefits.${b.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`benefits.${b.key}.desc`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Journey Timeline ── */}
      <section className="px-8 lg:px-16 py-20 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("journey.label")}
            </span>
            <Separator className="flex-1 bg-border/50" />
          </motion.div>

          <motion.h2
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="font-serif text-heading mb-16"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {t("journey.headline")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {journey.map((step, i) => (
              <motion.div
                key={step.key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.3 + i * 0.12 }}
                className="relative flex flex-col items-center text-center px-6 pb-8"
              >
                {/* Connector line */}
                {i < journey.length - 1 && (
                  <div className="hidden lg:block absolute top-6 start-[calc(50%+24px)] end-[calc(-50%+24px)] h-px bg-border" />
                )}

                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/30 bg-background mb-4">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>

                <span className="font-serif text-xs font-bold tracking-[0.2em] uppercase text-primary/60 mb-2 [[dir=rtl]_&]:tracking-normal">
                  {t(`journey.${step.key}.num`)}
                </span>
                <h3 className="font-serif text-lg text-heading mb-2">
                  {t(`journey.${step.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-48">
                  {t(`journey.${step.key}.desc`)}
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
          className="mx-auto max-w-6xl text-center"
        >
          <h2 className="font-serif text-heading mb-3" style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}>
            {t("cta.headline")}
          </h2>
          <p className="text-muted-foreground mb-8">{t("cta.description")}</p>
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
