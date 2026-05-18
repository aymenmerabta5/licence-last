"use client"

import { ArrowRight, ClipboardCheck, University, UserRound } from "lucide-react"
import * as motion from "motion/react-client"
import type {
  DeptHeadDashboardLabels,
  PendingApplicationItem,
} from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/types"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface PendingQueueOverviewProps {
  applications: PendingApplicationItem[]
  pendingCount: string
  queueIsBusy: boolean
  labels: DeptHeadDashboardLabels
}

function formatAcceptedDate(value: Date | string | null): string {
  if (!value) return "-"

  const date = typeof value === "string" ? new Date(value) : value

  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase()
}

export function PendingQueueOverview({
  applications,
  pendingCount,
  queueIsBusy,
  labels,
}: PendingQueueOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 relative">
      <motion.section
        {...reveal}
        transition={{ duration: 0.45, ease, delay: 0.05 }}
        className="lg:col-span-4 h-full lg:order-last"
      >
        <div className="h-full border border-border/80 bg-background hover:bg-foreground hover:text-background p-8 transition-all duration-500 shadow-[6px_6px_0_0_oklch(var(--border)_/_0.3)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] relative overflow-hidden group/stats">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMCIvPjxwYXRoIGQ9Ik0wLDRMMSw0TDEsM0wwLDNaIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-[0.03] mix-blend-overlay pointer-events-none group-hover/stats:opacity-[0.1]" />

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground/50 group-hover/stats:text-background/50 transition-colors border-b border-border/40 pb-4">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] [[dir=rtl]_&]:tracking-normal">
                  {labels.pendingLabel}
                </p>
              </div>
              <p className="font-serif text-4xl md:text-5xl lg:text-6xl leading-none text-foreground group-hover/stats:text-background py-4">
                {pendingCount}
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-border/40 group-hover/stats:border-background/20 transition-colors">
              <div className="flex items-center gap-2 text-foreground/50 group-hover/stats:text-background/50 mb-3">
                <University className="h-4 w-4 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] [[dir=rtl]_&]:tracking-normal">
                  {labels.queueStatusLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-2 w-2",
                    queueIsBusy
                      ? "bg-amber-500 animate-pulse"
                      : "bg-emerald-500",
                  )}
                />
                <p className="text-sm font-bold uppercase tracking-widest group-hover/stats:text-background">
                  {queueIsBusy ? labels.queueBusy : labels.queueClear}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        {...reveal}
        transition={{ duration: 0.45, ease, delay: 0.08 }}
        className="lg:col-span-8 space-y-8"
      >
        <div className="flex items-end justify-between border-b-4 border-foreground pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 block">
              Validation Queue
            </span>
            <h3 className="font-serif text-3xl md:text-5xl font-normal tracking-tighter text-foreground">
              {labels.recentTitle}
              <span className="text-primary/40 leading-none">.</span>
            </h3>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border/80 bg-background flex flex-col items-center justify-center">
            <h3 className="font-serif text-2xl text-foreground mb-3">
              {labels.empty}
            </h3>
          </div>
        ) : (
          <div className="border border-border/60 bg-background flex flex-col divide-y divide-border/60 shadow-[4px_4px_0_0_oklch(var(--border)_/_0.2)]">
            {applications.map((application, i) => (
              <Link
                key={application.id}
                href={
                  `/dashboard/dept-validations/${application.id}` as "/dashboard"
                }
                prefetch={false}
                className="group/item relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 transition-colors hover:bg-foreground hover:text-background"
              >
                <div className="flex items-center gap-4">
                  <span className="font-serif italic text-2xl text-foreground/20 group-hover/item:text-background/30 w-8 hidden sm:block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-xl sm:text-2xl font-normal mb-1">
                      {application.student.name ?? "Student"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-primary/80 group-hover/item:text-background/50">
                      <span>{application.company.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-border/20 pt-4 sm:pt-0 group-hover/item:border-background/20">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-foreground/50 group-hover/item:text-background/50">
                    <UserRound className="h-3.5 w-3.5" />
                    <span>{labels.acceptedOn}</span>
                  </div>
                  <span className="text-xs font-bold tracking-widest text-foreground group-hover/item:text-background">
                    {formatAcceptedDate(application.companyActionAt)}
                  </span>
                </div>

                {/* Hover Arrow */}
                <div className="absolute end-6 top-1/2 -translate-y-1/2 text-primary opacity-0 group-hover/item:opacity-100 -translate-x-4 group-hover/item:translate-x-0 transition-all duration-500 hidden sm:block">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  )
}
