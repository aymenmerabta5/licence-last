import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import {
  Users,
  Bot,
  ShieldCheck,
  FileCheck,
  Building2,
  Megaphone,
  UserCheck,
  Zap,
  ArrowRight,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"
import { reveal, ease } from "@/lib/animations"
import { MarqueeRibbon } from "@/app/[locale]/_components/MarqueeRibbon"
import { Metadata } from "next"

type Params = Promise<{ locale: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "pages.forCompanies" })
  return { title: t("metadata.title"), description: t("metadata.description") }
}

export default async function ForCompaniesPage({
  params,
}: {
  params: Params
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <Navbar />
      <MarqueeRibbon />
      <ForCompaniesContent />
      <Footer />
    </main>
  )
}

function ForCompaniesContent() {
  const t = useTranslations("pages.forCompanies")

  const headline = t("hero.headline")
  const highlight = t("hero.headlineHighlight")
  const idx = highlight.length > 0 ? headline.indexOf(highlight) : -1
  const hasHighlight = idx !== -1

  const benefits: Array<{ key: string; icon: LucideIcon }> = [
    { key: "pipeline", icon: Users },
    { key: "ai", icon: Bot },
    { key: "trust", icon: ShieldCheck },
    { key: "compliance", icon: FileCheck },
  ]

  const workflow: Array<{ key: string; icon: LucideIcon }> = [
    { key: "step1", icon: Building2 },
    { key: "step2", icon: Megaphone },
    { key: "step3", icon: UserCheck },
    { key: "step4", icon: Zap },
  ]

  const stats = ["students", "placement", "universities", "avgTime"] as const

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative px-8 lg:px-16 pt-20 pb-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100"
          aria-hidden="true"
        >
          <div className="absolute -bottom-32 -end-24 h-80 w-80 rounded-full bg-primary/6 blur-3xl" />
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
            className="mt-10"
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
          </motion.div>
        </div>
      </section>

      {/* ── Benefits ── */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.2 + i * 0.1 }}
                className="group flex gap-5 p-8 border-2 border-border hover:border-primary transition-colors duration-300"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-background text-primary transition-all group-hover:border-primary group-hover:bg-primary/5">
                  <b.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-heading mb-2">
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

      {/* ── Workflow ── */}
      <section className="px-8 lg:px-16 py-20 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("workflow.label")}
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
            {t("workflow.headline")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflow.map((step, i) => (
              <motion.div
                key={step.key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.3 + i * 0.12 }}
                className="relative"
              >
                {/* Connector */}
                {i < workflow.length - 1 && (
                  <div className="hidden lg:block absolute top-6 start-[calc(50%+24px)] end-[calc(-50%+24px)] h-px bg-border" />
                )}

                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/30 bg-background mb-4">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-serif text-xs font-bold tracking-[0.2em] uppercase text-primary/60 mb-2 [[dir=rtl]_&]:tracking-normal">
                    {t(`workflow.${step.key}.num`)}
                  </span>
                  <h3 className="font-serif text-lg text-heading mb-2">
                    {t(`workflow.${step.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-48">
                    {t(`workflow.${step.key}.desc`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="px-8 lg:px-16 py-20 border-t border-border">
        <motion.div
          {...reveal}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-6xl"
        >
          <div className="flex items-center gap-3 mb-10">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("stats.label")}
            </span>
            <Separator className="flex-1 bg-border/50" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-y-2 border-foreground dark:border-foreground/15">
            {stats.map((key, i) => (
              <motion.div
                key={key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.2 + i * 0.1 }}
                className="py-8 px-6 text-center"
                style={{
                  borderInlineEnd:
                    i < stats.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                }}
              >
                <div className="font-serif text-4xl mb-1 text-heading">
                  {t(`stats.${key}.value`)}
                </div>
                <div className="text-xs font-medium uppercase tracking-[0.15em] text-foreground/35 [[dir=rtl]_&]:tracking-normal">
                  {t(`stats.${key}.label`)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
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
