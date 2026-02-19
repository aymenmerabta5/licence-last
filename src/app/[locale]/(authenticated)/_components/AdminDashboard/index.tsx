"use client"

import { Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { PlatformBulletin } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/components/PlatformBulletin"
import { StatusBreakdown } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/components/StatusBreakdown"
import { TrustLeaderboard } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/components/TrustLeaderboard"
import { UniversityKpiGrid } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/components/UniversityKpiGrid"
import { useAdminDashboardData } from "@/app/[locale]/(authenticated)/_components/AdminDashboard/hooks/useAdminDashboardData"

interface AdminDashboardProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const { isSuperAdmin, stats, universityStats, isLoading, trustIndices } =
    useAdminDashboardData(user.role)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[50vh]">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="absolute inset-0 border-2 border-foreground animate-ping opacity-20" />
        </div>
      </div>
    )
  }

  const now = new Date()

  return (
    <div className="space-y-12">
      {/* Hero welcome card matching StudentDashboard WelcomeHero */}
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

          {/* Newspaper Date Column */}
          <div className="md:col-span-2 flex flex-col justify-start items-start md:border-r border-border md:pr-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/50 mb-4 [[dir=rtl]_&]:tracking-normal">
              {isSuperAdmin ? "System" : "University"}
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
            <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/50 mt-auto hidden md:block">
              HQ STATUS
            </div>
          </div>

          {/* Main Headings */}
          <div className="md:col-span-10 flex flex-col justify-center px-0 md:px-6">
            <h2 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-tighter text-foreground mb-6">
              <span className="block text-foreground/50 text-xl md:text-2xl font-sans tracking-tight mb-2 italic">
                {isSuperAdmin ? "Global Operations" : "Institutional Oversight"}
              </span>
              <span className="hover:text-primary transition-colors duration-500 selection:bg-primary selection:text-white block max-w-2xl">
                {isSuperAdmin
                  ? "Your ecosystem at a glance."
                  : "Track, coordinate, and steer your university."}
              </span>
            </h2>
            <p className="text-foreground/70 text-sm md:text-base font-light leading-relaxed max-w-xl">
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
          <div className="lg:col-span-8">
            <div className="border-2 border-foreground bg-background shadow-[6px_6px_0_0_oklch(var(--border)_/_0.3)] p-6 md:p-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(oklch(var(--border)_/_0.2)_1px,transparent_1px),linear-gradient(90deg,oklch(var(--border)_/_0.2)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50" />
              {stats && (
                <StatusBreakdown
                  applicationsByStatus={stats.applicationsByStatus}
                  totalApplications={stats.totalApplications}
                />
              )}
            </div>
          </div>
          <div className="lg:col-span-4 max-lg:order-last">
            <TrustLeaderboard indices={trustIndices} />
          </div>
        </div>
      )}
    </div>
  )
}
