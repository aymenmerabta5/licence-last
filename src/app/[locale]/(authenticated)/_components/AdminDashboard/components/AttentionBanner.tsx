"use client"

import { ArrowRight, Clock, ShieldAlert } from "lucide-react"
import * as motion from "motion/react-client"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"

interface AttentionBannerProps {
  pendingCount: number
  hasPendingMore: boolean
}

export function AttentionBanner({
  pendingCount,
  hasPendingMore,
}: AttentionBannerProps) {
  if (pendingCount === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease }}
    >
      <Link href="/dashboard/admin/validations">
        <div className="group relative overflow-hidden border-s-4 border-s-primary bg-primary/[0.03] dark:bg-primary/[0.06] p-6 sm:p-7 transition-colors hover:bg-primary/[0.05] dark:hover:bg-primary/[0.08]">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,currentColor_10px,currentColor_11px)]" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-heading text-sm tracking-tight">
                    Requiring Your Attention
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <Clock className="h-2.5 w-2.5" />
                    Pending
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-serif text-lg font-bold text-heading">
                    {pendingCount}
                    {hasPendingMore ? "+" : ""}
                  </span>{" "}
                  placements awaiting validation. Review and approve matching
                  requests.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary shrink-0 group-hover:gap-3 transition-all">
              Review Queue{" "}
              <ArrowRight className="h-3.5 w-3.5 [[dir=rtl]_&]:rotate-180" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
