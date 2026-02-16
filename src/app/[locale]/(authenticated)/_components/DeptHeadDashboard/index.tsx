"use client"

import { useQuery } from "@tanstack/react-query"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ArrowRight, ClipboardCheck, Loader2, University, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, reveal } from "@/lib/animations"
import { orpc } from "@/server/orpc/client"

interface DeptHeadDashboardProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for consistent dashboard component interface
export function DeptHeadDashboard({ user }: DeptHeadDashboardProps) {
  const t = useTranslations("dashboard.deptHeadDashboard")

  const { data: pendingResult, isLoading } = useQuery(
    orpc.deptHead.listPending.queryOptions({
      input: { limit: 6 },
    }),
  )

  const applications = pendingResult?.applications ?? []
  const pendingCount = pendingResult?.hasMore ? `${applications.length}+` : `${applications.length}`

  return (
    <div className="space-y-8">
      <motion.section
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="space-y-4 border border-border/50 p-7"
      >
        <span className="inline-flex text-[10px] font-bold uppercase tracking-[0.2em] text-primary [[dir=rtl]_&]:tracking-normal">
          {t("kicker")}
        </span>
        <h2 className="font-serif text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-heading">
          {t("title")}
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground">{t("description")}</p>
        <Link
          href={"/dashboard/dept-validations" as "/dashboard"}
          className="inline-flex"
        >
          <Button variant="editorial" size="editorial-sm" className="rounded-lg">
            {t("openQueue")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.section>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <motion.section
            {...reveal}
            transition={{ duration: 0.45, ease, delay: 0.05 }}
            className="space-y-4 border border-border/50 p-6 lg:col-span-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <ClipboardCheck className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.16em] [[dir=rtl]_&]:tracking-normal">
                {t("pendingLabel")}
              </p>
            </div>
            <p className="font-serif text-4xl leading-none text-heading">{pendingCount}</p>

            <div className="flex items-center gap-2 text-muted-foreground">
              <University className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.16em] [[dir=rtl]_&]:tracking-normal">
                {t("queueStatusLabel")}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {pendingResult?.hasMore ? t("queueBusy") : t("queueClear")}
            </p>
          </motion.section>

          <motion.section
            {...reveal}
            transition={{ duration: 0.45, ease, delay: 0.08 }}
            className="space-y-4 border border-border/50 p-6 lg:col-span-8"
          >
            <h3 className="font-serif text-xl text-heading">{t("recentTitle")}</h3>

            {applications.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
              <div className="space-y-2">
                {applications.map((application) => (
                  <Link
                    key={application.id}
                    href={`/dashboard/dept-validations/${application.id}` as "/dashboard"}
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
                      {t("acceptedOn")} {formatAcceptedDate(application.companyActionAt)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.section>
        </div>
      )}
    </div>
  )
}
