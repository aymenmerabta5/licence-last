"use client"

import { CalendarCheck, CalendarClock, CalendarDays } from "lucide-react"
import * as motion from "motion/react-client"
import type { InterviewsRole } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { Badge } from "@/components/ui/badge"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

interface InterviewsHeaderProps {
  role: InterviewsRole
  counts?: {
    total: number
    pending: number
    confirmed: number
  }
}

const ROLE_LABELS: Record<InterviewsRole, string> = {
  student: "Student",
  company_admin: "Company",
}

export function InterviewsHeader({ role, counts }: InterviewsHeaderProps) {
  return (
    <header className="space-y-6">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <div className="space-y-4">
        <motion.div {...reveal} transition={revealWithDelay(0.05)}>
          <Badge variant="editorial-muted">{ROLE_LABELS[role]} dashboard</Badge>
        </motion.div>

        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="space-y-2"
        >
          <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
            Interviews
          </h1>
          <p className="text-sm font-light text-muted-foreground max-w-lg">
            {role === "company_admin"
              ? "Schedule and manage interview sessions with candidates."
              : "View and confirm interview invitations from companies."}
          </p>
        </motion.div>

        {counts && counts.total > 0 && (
          <motion.div
            {...reveal}
            transition={revealWithDelay(0.15)}
            className="flex items-center gap-6 pt-2"
          >
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="font-serif text-xl text-heading">
                {counts.total}
              </span>
              <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                Total
              </span>
            </div>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-2 text-sm">
              <CalendarClock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <span className="font-serif text-xl text-heading">
                {counts.pending}
              </span>
              <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                Pending
              </span>
            </div>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-2 text-sm">
              <CalendarCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              <span className="font-serif text-xl text-heading">
                {counts.confirmed}
              </span>
              <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                Confirmed
              </span>
            </div>
          </motion.div>
        )}

        <motion.div
          {...reveal}
          transition={revealWithDelay(0.2)}
          className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border/50 pt-4"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          <span>All times are shown in your local timezone.</span>
        </motion.div>
      </div>
    </header>
  )
}
