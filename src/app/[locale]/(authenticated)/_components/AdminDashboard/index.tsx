"use client"

import * as motion from "motion/react-client"
import { Loader2 } from "lucide-react"

import { ease } from "@/lib/animations"

import { PlatformBulletin } from "./components/PlatformBulletin"
import { StatusBreakdown } from "./components/StatusBreakdown"
import { TrustLeaderboard } from "./components/TrustLeaderboard"
import { UniversityKpiGrid } from "./components/UniversityKpiGrid"
import { useAdminDashboardData } from "./hooks/useAdminDashboardData"

interface AdminDashboardProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const {
    isSuperAdmin,
    stats,
    universityStats,
    isLoading,
    trustIndices,
  } = useAdminDashboardData(user.role)

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
                {isSuperAdmin ? "Platform Intelligence" : "University Operations"}
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

            <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.08] tracking-tight text-heading max-w-xl">
              {isSuperAdmin
                ? "Your ecosystem at a glance."
                : "Track, coordinate, and steer your university."}
            </h2>
            <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-lg mt-3">
              {isSuperAdmin
                ? "Monitor platform health, validate placements, and track institutional progress across the Internex network."
                : "Follow key student and department indicators to run your university internship operations from one place."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Platform stats bar — super_admin only */}
      {isSuperAdmin && stats && <PlatformBulletin stats={stats} />}

      {/* University metrics grid — university_admin only */}
      {!isSuperAdmin && universityStats && (
        <UniversityKpiGrid stats={universityStats} />
      )}

      {isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main column */}
          <div className="lg:col-span-7 space-y-10">
            {stats && (
              <StatusBreakdown
                applicationsByStatus={stats.applicationsByStatus}
                totalApplications={stats.totalApplications}
              />
            )}
            <TrustLeaderboard indices={trustIndices} />
          </div>
        </div>
      )}
    </div>
  )
}
