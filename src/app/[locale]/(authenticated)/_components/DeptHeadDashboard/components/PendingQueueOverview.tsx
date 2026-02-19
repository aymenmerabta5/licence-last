"use client"

import { ClipboardCheck, University, UserRound } from "lucide-react"
import * as motion from "motion/react-client"
import type {
  DeptHeadDashboardLabels,
  PendingApplicationItem,
} from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard/types"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"

interface PendingQueueOverviewProps {
  applications: PendingApplicationItem[]
  pendingCount: string
  queueIsBusy: boolean
  labels: DeptHeadDashboardLabels
}

function formatAcceptedDate(value: Date | string | null): string {
  if (!value) return "-"

  const date = typeof value === "string" ? new Date(value) : value

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function PendingQueueOverview({
  applications,
  pendingCount,
  queueIsBusy,
  labels,
}: PendingQueueOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <motion.section
        {...reveal}
        transition={{ duration: 0.45, ease, delay: 0.05 }}
        className="space-y-4 border border-border/50 p-6 lg:col-span-4"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <ClipboardCheck className="h-4 w-4" />
          <p className="text-xs uppercase tracking-[0.16em] [[dir=rtl]_&]:tracking-normal">
            {labels.pendingLabel}
          </p>
        </div>
        <p className="font-serif text-4xl leading-none text-heading">
          {pendingCount}
        </p>

        <div className="flex items-center gap-2 text-muted-foreground">
          <University className="h-4 w-4" />
          <p className="text-xs uppercase tracking-[0.16em] [[dir=rtl]_&]:tracking-normal">
            {labels.queueStatusLabel}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {queueIsBusy ? labels.queueBusy : labels.queueClear}
        </p>
      </motion.section>

      <motion.section
        {...reveal}
        transition={{ duration: 0.45, ease, delay: 0.08 }}
        className="space-y-4 border border-border/50 p-6 lg:col-span-8"
      >
        <h3 className="font-serif text-xl text-heading">
          {labels.recentTitle}
        </h3>

        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <div className="space-y-2">
            {applications.map((application) => (
              <Link
                key={application.id}
                href={
                  `/dashboard/dept-validations/${application.id}` as "/dashboard"
                }
                className="flex items-center justify-between gap-4 border border-border/50 p-3 transition-colors hover:border-primary/30"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-heading">
                    {application.student.name ?? "Student"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {application.company.name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <UserRound className="h-3.5 w-3.5" />
                  {labels.acceptedOn}{" "}
                  {formatAcceptedDate(application.companyActionAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  )
}
