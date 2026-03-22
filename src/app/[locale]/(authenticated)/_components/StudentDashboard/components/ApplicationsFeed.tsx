"use client"

import { ArrowRight, Search, FileText } from "lucide-react"
import { ApplicationCard } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/components/ApplicationCard"
import type { ApplicationRow } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

interface ApplicationsFeedProps {
  applications: ApplicationRow[]
  labels: {
    title: string
    viewAll: string
    emptyMessage: string
    exploreButton: string
  }
}

export function ApplicationsFeed({
  applications,
  labels,
}: ApplicationsFeedProps) {
  return (
    <section className="relative">
      {/* Decorative vertical line */}
      <div className="absolute top-0 bottom-0 -start-6 w-px bg-border/40 hidden lg:block" />

      {/* Editorial section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b-4 border-foreground">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 block">
            Recent Activity
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tighter text-foreground mb-4 sm:mb-0">
            {labels.title}
            <span className="text-primary/40 leading-none">.</span>
          </h2>
        </div>
        <Link href="/dashboard/applications">
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground hover:bg-foreground hover:text-background rounded-none border border-transparent hover:border-foreground transition-all duration-300 font-bold uppercase tracking-[0.15em] text-[10px] py-1 h-8 group"
          >
            {labels.viewAll}{" "}
            <ArrowRight className="h-3 w-3 ms-2 transition-transform duration-500 group-hover:translate-x-2" />
          </Button>
        </Link>
      </div>

      {applications.length > 0 ? (
        <div className="border border-border/60 bg-background flex flex-col divide-y divide-border/60 w-full shadow-[6px_6px_0_0_oklch(var(--border)_/_0.3)]">
          {applications.map((app, i) => (
            <ApplicationCard key={app.id} application={app} index={i} />
          ))}
        </div>
      ) : (
        <div className="relative py-20 px-6 text-center border-2 border-dashed border-border/80 bg-background overflow-hidden group">
          {/* Subtle noise/texture */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,...')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 h-16 w-16 border border-border/80 bg-background flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-transform duration-500 shadow-[4px_4px_0_0_oklch(var(--primary)_/_0.4)]">
              <FileText className="h-6 w-6 text-foreground/40" />
            </div>

            <h3 className="font-serif text-2xl text-foreground mb-3">
              {labels.emptyMessage}
            </h3>
            <p className="text-xs text-foreground/50 font-medium max-w-sm mb-8">
              Your applications will appear here as you discover and apply for
              matching opportunities.
            </p>

            <Link href="/dashboard/explore">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-bold uppercase tracking-[0.15em] text-[10px] shadow-[4px_4px_0_0_oklch(var(--foreground))]">
                <Search className="h-3.5 w-3.5 me-2" /> {labels.exploreButton}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
