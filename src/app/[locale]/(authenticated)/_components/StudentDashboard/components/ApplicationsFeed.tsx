"use client"

import { ArrowRight, Briefcase, Search } from "lucide-react"
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
    <section>
      {/* Editorial section header */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-foreground dark:border-foreground/15 mb-6">
        <h2 className="font-serif text-xl font-bold text-heading">
          {labels.title}
        </h2>
        <Link href="/dashboard/applications">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 group text-[9px] font-bold uppercase tracking-[0.15em] [[dir=rtl]_&]:tracking-normal"
          >
            {labels.viewAll}{" "}
            <ArrowRight className="h-3.5 w-3.5 ms-1.5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      {applications.length > 0 ? (
        <div className="divide-y divide-border/40">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-4 border border-border/30">
          <div className="inline-flex items-center justify-center p-3 bg-primary/5">
            <Briefcase className="h-5 w-5 text-muted-foreground/30" />
          </div>
          <p className="text-xs text-muted-foreground/50 font-medium max-w-xs mx-auto leading-relaxed">
            {labels.emptyMessage}
          </p>
          <Link href="/dashboard/explore">
            <Button
              variant="editorial"
              size="editorial-sm"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground mt-2"
            >
              <Search className="h-3.5 w-3.5 me-2" /> {labels.exploreButton}
            </Button>
          </Link>
        </div>
      )}
    </section>
  )
}
