import type { LucideIcon } from "lucide-react"
import { ArrowRight, Eye, Globe, Lightbulb, Shield } from "lucide-react"
import * as motion from "motion/react-client"
import { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { MarqueeRibbon } from "@/app/[locale]/_components/MarqueeRibbon"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "pages.about" })
  return { title: t("metadata.title"), description: t("metadata.description") }
}

export default async function AboutPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <Navbar />
      <MarqueeRibbon />
      <AboutContent />
      <Footer />
    </main>
  )
}

function AboutContent() {
  const t = useTranslations("pages.about")

  const headline = t("hero.headline")
  const highlight = t("hero.headlineHighlight")
  const idx = highlight.length > 0 ? headline.indexOf(highlight) : -1
  const hasHighlight = idx !== -1

  const values: Array<{ key: string; icon: LucideIcon }> = [
    { key: "innovation", icon: Lightbulb },
    { key: "accessibility", icon: Globe },
    { key: "transparency", icon: Eye },
    { key: "reliability", icon: Shield },
  ]

  const stats = ["students", "companies", "universities", "placement"] as const

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative px-8 lg:px-16 pt-20 pb-24">
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

      {/* ── Mission ── */}
      <section className="px-8 lg:px-16 py-20 border-t border-border">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <motion.div
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
                {t("mission.label")}
              </span>
              <Separator className="flex-1 bg-border/50" />
            </motion.div>
            <motion.h2
              {...reveal}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="font-serif text-heading sticky top-8"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {t("mission.headline")}
            </motion.h2>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-8">
            {(["p1", "p2", "p3"] as const).map((key, i) => (
              <motion.p
                key={key}
                {...reveal}
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                  delay: 0.2 + i * 0.1,
                }}
                className="text-muted-foreground leading-relaxed text-lg"
              >
                {t(`mission.paragraphs.${key}`)}
              </motion.p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="px-8 lg:px-16 py-20 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("values.label")}
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
            {t("values.headline")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.2 + i * 0.1 }}
                className="group flex gap-5 p-8 border-2 border-border hover:border-primary transition-colors duration-300"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-background text-primary transition-all group-hover:border-primary group-hover:bg-primary/5">
                  <v.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-heading mb-2">
                    {t(`values.${v.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`values.${v.key}.desc`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
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
                    i < stats.length - 1 ? "1px solid var(--border)" : "none",
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
          className="mx-auto max-w-6xl text-center"
        >
          <h2
            className="font-serif text-heading mb-3"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)" }}
          >
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
