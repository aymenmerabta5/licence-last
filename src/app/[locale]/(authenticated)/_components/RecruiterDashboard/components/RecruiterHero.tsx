"use client"

import * as motion from "motion/react-client"

import { ease } from "@/lib/animations"

interface RecruiterHeroProps {
  activeOffers: number
  trustData: {
    trustScore: number
  } | null
}

export function RecruiterHero({ activeOffers, trustData }: RecruiterHeroProps) {
  const currentDate = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="relative"
    >
      <div className="h-0.5 bg-primary" />
      <div className="relative overflow-hidden border border-t-0 border-border/50 p-8 md:p-10">
        <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100">
          <div className="absolute -top-20 end-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary [[dir=rtl]_&]:tracking-normal">
              Talent Acquisition
            </span>
            <span className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 sm:block [[dir=rtl]_&]:tracking-normal">
              {currentDate}
            </span>
          </div>

          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-4 lg:col-span-8">
              <h2 className="max-w-xl font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.08] tracking-tight text-heading">
                {activeOffers > 0
                  ? "Your pipeline is active."
                  : "Ready to find your next intern?"}
              </h2>
              <p className="max-w-lg text-sm font-light leading-relaxed text-muted-foreground">
                {activeOffers > 0
                  ? `${activeOffers} live offer${activeOffers !== 1 ? "s" : ""} attracting candidates. Track applications, manage your pipeline, and close positions.`
                  : "Post internship offers, review candidates, and manage your recruitment pipeline from one place."}
              </p>
            </div>

            {trustData && (
              <div className="lg:col-span-4">
                <div className="space-y-2 border-s-2 border-primary/20 ps-6">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 [[dir=rtl]_&]:tracking-normal">
                    Trust Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold leading-none text-heading tabular-nums">
                      {trustData.trustScore}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-primary">
                      / 100
                    </span>
                  </div>
                  <div className="h-0.5 w-full overflow-hidden bg-border/30">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(trustData.trustScore, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5, ease }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
