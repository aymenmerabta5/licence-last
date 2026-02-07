import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ArrowRight } from "lucide-react"

import { Link } from "@/i18n/routing"
import { Navbar } from "@/components/Navbar"
import { Separator } from "@/components/ui/separator"

/* ── Shared reveal transition ── */
const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

/* ── Decorative Dot Separator ── */
function DotSeparator({
  lineWidth = 40,
  delay = 0,
}: {
  lineWidth?: number
  delay?: number
}) {
  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.7, ease, delay }}
      className="flex items-center justify-center gap-4"
      aria-hidden="true"
    >
      <span
        className="h-px bg-foreground/15 ed-smooth"
        style={{ width: lineWidth }}
      />
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      <span
        className="h-px bg-foreground/15 ed-smooth"
        style={{ width: lineWidth }}
      />
    </motion.div>
  )
}

export default function NotFoundPage() {
  const t = useTranslations("notFound")

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground ed-smooth">
      <Navbar />

      {/* ── 404 Content ── */}
      <div className="flex-1 relative flex items-center justify-center px-6 py-16 lg:py-24">
        {/* Ambient glow — dark mode only */}
        <div
          className="ed-hero-glow absolute inset-0 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
          {/* Edition marker */}
          <motion.span
            {...reveal}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
            className="text-[10px] font-medium tracking-[0.35em] uppercase text-primary mb-10"
          >
            {t("edition")}
          </motion.span>

          {/* Top separator */}
          <DotSeparator lineWidth={56} delay={0.2} />

          {/* Giant 404 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.3 }}
            className="mt-10 mb-6"
          >
            <span
              className="font-serif text-heading ed-smooth ed-card-num block"
              style={{
                fontSize: "clamp(7rem, 18vw, 14rem)",
                lineHeight: 0.85,
                letterSpacing: "-0.04em",
              }}
            >
              4
              <span className="relative inline-block">
                <span className="text-primary">0</span>
                {/* Decorative underline beneath the zero */}
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, ease, delay: 0.8 }}
                  className="absolute -bottom-1 start-0 end-0 h-[3px] bg-primary origin-start"
                  style={{
                    boxShadow:
                      "var(--tw-shadow, none)",
                  }}
                  aria-hidden="true"
                />
              </span>
              4
            </span>
          </motion.div>

          {/* Middle separator */}
          <DotSeparator lineWidth={40} delay={0.45} />

          {/* Headline */}
          <motion.h1
            {...reveal}
            transition={{ duration: 0.7, ease, delay: 0.5 }}
            className="font-serif text-2xl md:text-3xl text-heading tracking-tight mt-8 mb-4 ed-smooth"
          >
            {t("headline")}
          </motion.h1>

          {/* Divider line */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.55 }}
            className="w-full max-w-xs mb-6"
          >
            <Separator className="bg-border/50 ed-smooth" />
          </motion.div>

          {/* Description */}
          <motion.p
            {...reveal}
            transition={{ duration: 0.7, ease, delay: 0.6 }}
            className="text-sm leading-relaxed font-light text-muted-foreground max-w-sm mb-10 ed-smooth"
          >
            {t("description")}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease, delay: 0.7 }}
          >
            <Link
              href="/"
              aria-label={t("returnHome")}
              className="rounded-none inline-flex items-center justify-center gap-3 border-2 border-secondary text-secondary bg-transparent font-bold uppercase tracking-[0.15em] hover:bg-secondary hover:text-secondary-foreground ed-smooth-fast h-10 px-5 py-2.5 text-xs group"
            >
              {t("returnHome")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
            </Link>
          </motion.div>

          {/* Bottom separator */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.6, ease, delay: 0.8 }}
            className="mt-14"
          >
            <DotSeparator lineWidth={20} delay={0.85} />
          </motion.div>

          {/* Suggestion text */}
          <motion.p
            {...reveal}
            transition={{ duration: 0.7, ease, delay: 0.9 }}
            className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground/50 mt-8 ed-smooth"
          >
            {t("suggestion")}
          </motion.p>
        </div>
      </div>
    </main>
  )
}
