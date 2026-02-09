"use client"

import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import { Star } from "lucide-react"

export function MarqueeRibbon() {
  const t = useTranslations("marquee")
  const locale = useLocale()
  const items = t.raw("items") as string[]
  const xKeyframes: string[] = locale === "ar" ? ["-50%", "0%"] : ["0%", "-50%"]

  return (
    <div
      className="overflow-hidden py-3 bg-secondary transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      aria-label={t("aria")}
    >
      <motion.div
        className="flex w-max whitespace-nowrap gap-12 will-change-transform"
        animate={{ x: xKeyframes }}
        transition={{ duration: 25, ease: "linear", repeat: Infinity }}
      >
        {[...Array(2)].map((_, setIdx) => (
          <div key={setIdx} className="flex items-center gap-12 shrink-0">
            {items.map((txt, i) => (
              <span key={i} className="flex items-center gap-3">
                <Star
                  className="h-3 w-3 text-primary dark:text-primary transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold tracking-[0.2em] text-secondary-foreground dark:text-background transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] [[dir=rtl]_&]:tracking-normal">
                  {txt}
                </span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
