import { ArrowRight } from "lucide-react"
import * as motion from "motion/react-client"

import type { HeroContentProps } from "@/app/[locale]/_components/HeroSection/types"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"
import { ease, getRevealVariants, getTransition } from "@/lib/animations"

export function HeroContent({
  volumeLabel,
  headline,
  descriptionPrimary,
  descriptionSecondary,
  ctaLabel,
  ctaAriaLabel,
  freeForStudentsLabel,
  prefersReducedMotion,
}: HeroContentProps) {
  const revealVariants = getRevealVariants(prefersReducedMotion)

  return (
    <div className="lg:col-span-7">
      <motion.div
        {...revealVariants}
        transition={getTransition(
          { duration: 0.7, ease },
          prefersReducedMotion,
        )}
        className="mb-8 flex items-center gap-3"
      >
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary [[dir=rtl]_&]:tracking-normal">
          {volumeLabel}
        </span>
        <Separator className="flex-1 bg-border/50 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />
      </motion.div>

      <motion.h1
        {...revealVariants}
        transition={getTransition(
          { duration: 0.7, ease, delay: 0.12 },
          prefersReducedMotion,
        )}
        className="font-serif text-heading transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          fontSize: "clamp(2rem, 8vw, 5.5rem)",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          textWrap: "balance",
        }}
      >
        {headline.hasHighlight ? (
          <>
            {headline.before}
            <span className="relative inline-block text-primary">
              {headline.highlight}
              <motion.span
                initial={{ scaleX: prefersReducedMotion ? 1 : 0 }}
                animate={{ scaleX: 1 }}
                transition={getTransition(
                  { duration: 0.6, ease, delay: 0.55 },
                  prefersReducedMotion,
                )}
                className="pointer-events-none absolute -bottom-1 start-0 end-0 h-[3px] origin-left bg-primary [[dir=rtl]_&]:origin-right"
                aria-hidden="true"
              />
            </span>
            {headline.after}
          </>
        ) : (
          headline.fallback
        )}
      </motion.h1>

      <motion.div
        {...revealVariants}
        transition={getTransition(
          { duration: 0.7, ease, delay: 0.24 },
          prefersReducedMotion,
        )}
        className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 border-t border-border pt-6 sm:pt-8 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      >
        <p className="text-sm leading-relaxed font-light text-muted-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {descriptionPrimary}
        </p>
        <p className="text-sm leading-relaxed font-light text-muted-foreground transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {descriptionSecondary}
        </p>
      </motion.div>

      <motion.div
        {...revealVariants}
        transition={getTransition(
          { duration: 0.7, ease, delay: 0.36 },
          prefersReducedMotion,
        )}
        className="mt-6 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-6"
      >
        <Button
          variant="editorial-link"
          size="editorial-sm"
          className="group"
          nativeButton={false}
          render={<Link href="/discover" />}
          aria-label={ctaAriaLabel}
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2 [[dir=rtl]_&]:group-hover:-translate-x-2" />
        </Button>
        <Separator
          orientation="vertical"
          className="h-5 bg-foreground/20 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] dark:bg-foreground/15"
        />
        <span className="text-xs tracking-wide text-foreground/40 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] [[dir=rtl]_&]:tracking-normal dark:text-foreground/35">
          {freeForStudentsLabel}
        </span>
      </motion.div>
    </div>
  )
}
