"use client"

import * as motion from "motion/react-client"

interface RecruiterHeroProps {
  activeOffers: number
  trustData: {
    trustScore: number
  } | null
}

export function RecruiterHero({ activeOffers, trustData }: RecruiterHeroProps) {
  const now = new Date()

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      <div className="relative border-y-4 border-foreground dark:border-foreground/80 py-8 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-4 group">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary -translate-x-1 -translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary translate-x-1 translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Date Column */}
        <div className="md:col-span-2 flex flex-col justify-start items-start md:border-r border-border md:pr-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/50 mb-4 [[dir=rtl]_&]:tracking-normal">
            Hiring Status
          </div>
          <motion.div
            className="font-serif text-3xl md:text-5xl font-normal leading-none text-primary"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {now.getDate().toString().padStart(2, "0")}
          </motion.div>
          <div className="text-xs uppercase font-medium tracking-[0.2em] mt-2 text-foreground/80 [[dir=rtl]_&]:tracking-normal">
            {now.toLocaleString("en-US", { month: "short" })} '
            {now.getFullYear().toString().slice(-2)}
          </div>
          <div className="w-full h-[1px] bg-border my-6 hidden md:block" />
          <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/50 flex flex-col gap-1 hidden md:flex">
            <span>Talent Acquisition</span>
          </div>
        </div>

        {/* Main Headings */}
        <div className="md:col-span-6 flex flex-col justify-center px-0 md:px-6">
          <h2 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-tighter text-foreground mb-6">
            <span className="hover:text-primary transition-colors duration-500 selection:bg-primary selection:text-white block">
              {activeOffers > 0
                ? "Your pipeline is active."
                : "Ready to find your next intern?"}
            </span>
          </h2>
          <p className="text-foreground/70 text-sm md:text-base font-light leading-relaxed max-w-xl">
            {activeOffers > 0
              ? `${activeOffers} live offer${activeOffers !== 1 ? "s" : ""} attracting candidates. Track applications, manage your pipeline, and close positions.`
              : "Post internship offers, review candidates, and manage your recruitment pipeline from one place."}
          </p>
        </div>

        {/* Profile Strength & CTAs */}
        {trustData && (
          <div className="md:col-span-4 flex flex-col justify-between md:pl-6 md:border-l border-border group/meter">
            <div className="space-y-4 flex-grow mb-8 md:mb-0">
              <div className="flex items-end justify-between border-b-2 border-foreground/20 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 [[dir=rtl]_&]:tracking-normal">
                  Trust Score
                </span>
                <span className="font-serif text-3xl md:text-4xl leading-none text-foreground tracking-tighter tabular-nums">
                  {trustData.trustScore}
                  <span className="text-xl text-primary">/100</span>
                </span>
              </div>

              <div className="relative h-1.5 w-full bg-border overflow-hidden rounded-none">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(trustData.trustScore, 100)}%` }}
                  transition={{
                    duration: 1.2,
                    delay: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
                {/* Texture overlay on progress bar */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,...')] opacity-30 mix-blend-overlay"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
