"use client"

import * as motion from "motion/react-client"
import { Loader2 } from "lucide-react"
import { ease } from "@/lib/animations"

import { useRecruiterDashboardData } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/hooks/useRecruiterDashboardData"
import { OffersPulse } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/components/OffersPulse"
import { TrustGauge } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/components/TrustGauge"
import { RecentOffers } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/components/RecentOffers"
import { RecruiterQuickActions } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard/components/RecruiterQuickActions"

interface RecruiterDashboardProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for consistent dashboard component interface
export function RecruiterDashboard({ user }: RecruiterDashboardProps) {
  const {
    activeOffers,
    draftOffers,
    closedOffers,
    totalCandidates,
    activeCandidates,
    recentOffers,
    trustData,
    isTrustLoading,
    isLoading,
  } = useRecruiterDashboardData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Hero welcome card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="relative"
      >
        <div className="h-0.5 bg-primary" />
        <div className="border border-t-0 border-border/50 p-8 md:p-10 relative overflow-hidden">
          {/* Dark mode glow */}
          <div className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100">
            <div className="absolute -top-20 end-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary [[dir=rtl]_&]:tracking-normal">
                Talent Acquisition
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 hidden sm:block [[dir=rtl]_&]:tracking-normal">
                {new Date()
                  .toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                  .toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
              <div className="lg:col-span-8 space-y-4">
                <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.08] tracking-tight text-heading max-w-xl">
                  {activeOffers > 0
                    ? "Your pipeline is active."
                    : "Ready to find your next intern?"}
                </h2>
                <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-lg">
                  {activeOffers > 0
                    ? `${activeOffers} live offer${activeOffers !== 1 ? "s" : ""} attracting candidates. Track applications, manage your pipeline, and close positions.`
                    : "Post internship offers, review candidates, and manage your recruitment pipeline from one place."}
                </p>
              </div>

              {/* Trust badge — compact inline */}
              {trustData && (
                <div className="lg:col-span-4">
                  <div className="border-s-2 border-primary/20 ps-6 space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 [[dir=rtl]_&]:tracking-normal">
                      Trust Score
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-3xl font-bold text-heading leading-none tabular-nums">
                        {trustData.trustScore}
                      </span>
                      <span className="text-[10px] font-bold text-primary uppercase">
                        / 100
                      </span>
                    </div>
                    <div className="h-0.5 w-full bg-border/30 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(trustData.trustScore, 100)}%`,
                        }}
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

      {/* Stats bar */}
      <OffersPulse
        activeOffers={activeOffers}
        draftOffers={draftOffers}
        totalCandidates={totalCandidates}
        activeCandidates={activeCandidates}
        closedOffers={closedOffers}
      />

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main column */}
        <div className="lg:col-span-7 space-y-10">
          <RecentOffers offers={recentOffers} />
          <TrustGauge trustData={trustData} isLoading={isTrustLoading} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-5">
          <RecruiterQuickActions />
        </div>
      </div>
    </div>
  )
}
