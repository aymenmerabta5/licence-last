import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Bot,
  FileText,
  ScrollText,
  Search,
  Sparkles,
} from "lucide-react"
import * as motion from "motion/react-client"
import type { DiscoverSectionProps } from "@/app/[locale]/discover/_components/DiscoverContent/types"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ease, reveal } from "@/lib/animations"

const FEATURES: Array<{ key: string; icon: LucideIcon }> = [
  { key: "matching", icon: Sparkles },
  { key: "search", icon: Search },
  { key: "assistant", icon: Bot },
  { key: "cv", icon: FileText },
  { key: "documents", icon: ScrollText },
  { key: "tracking", icon: Activity },
]

export function DiscoverHeroFeaturesSection({ t }: DiscoverSectionProps) {
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
          <div className="absolute -top-24 -start-24 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
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
        <div className="mx-auto max-w-6xl">
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-6 flex items-center gap-3"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
              {t("features.label")}
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
            {t("features.headline")}
          </motion.h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.key}
                {...reveal}
                transition={{ duration: 0.6, ease, delay: 0.2 + index * 0.08 }}
              >
                <Card variant="editorial">
                  <CardHeader>
                    <span className="font-serif text-4xl font-normal text-primary transition-colors duration-[400ms] dark:drop-shadow-[0_0_18px_var(--color-primary)] group-hover/card:text-secondary-foreground dark:group-hover/card:text-primary-foreground">
                      {t(`features.items.${feature.key}.num`)}
                    </span>
                    <CardAction>
                      <feature.icon className="h-5 w-5 opacity-30" />
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="mb-2">
                      {t(`features.items.${feature.key}.title`)}
                    </CardTitle>
                    <CardDescription>
                      {t(`features.items.${feature.key}.desc`)}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
