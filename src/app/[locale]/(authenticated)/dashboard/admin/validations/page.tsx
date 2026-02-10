"use client"

import { useRef, useCallback, useEffect } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useInfiniteQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Loader2,
  Clock,
  GraduationCap,
  Calendar,
  ChevronRight,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import { orpcClient } from "@/server/orpc/client"
import type { ListPendingApplicationsResult } from "@/server/services/placements/list-pending"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

const INTERNSHIP_TYPE_LABELS: Record<string, string> = {
  pfe: "PFE",
  immersion: "Immersion",
  summer: "Summer",
  practical: "Practical",
}

const INTERNSHIP_TYPE_COLORS: Record<string, string> = {
  pfe: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  immersion:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  summer:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  practical:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
}

function formatDate(date: Date | string | null): string {
  if (!date) return "N/A"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function AdminValidationsPage() {
  const t = useTranslations("dashboard.admin.validations")

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<ListPendingApplicationsResult>({
    queryKey: ["placements", "listPending"],
    queryFn: async ({ pageParam }) => {
      return orpcClient.placements.listPending({
        cursor: pageParam as { createdAt: string; id: string } | undefined,
        limit: 15,
      })
    },
    initialPageParam: undefined as { createdAt: string; id: string } | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const applications = data?.pages.flatMap((p) => p.applications) ?? []

  const sentinelRef = useRef<HTMLDivElement>(null)
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "200px",
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleIntersection])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <Link
          href={"/dashboard/admin" as "/dashboard"}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("backToDashboard")}
        </Link>

        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-heading tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            {t("description")}
          </p>
        </div>
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && applications.length === 0 && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="border border-dashed border-border p-12 text-center space-y-2"
        >
          <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </motion.div>
      )}

      {applications.length > 0 && (
        <div className="space-y-3">
          {applications.map((app, i) => (
            <motion.div
              key={app.id}
              {...reveal}
              transition={{ duration: 0.4, ease, delay: 0.03 * i }}
            >
              <Link
                href={`/dashboard/admin/validations/${app.id}` as "/dashboard"}
                className="block border border-border p-5 hover:border-primary/30 hover:bg-muted/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-3 flex-1">
                    {/* Header: Student & Company */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary">
                        {app.student.name?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif text-lg text-heading">
                            {app.student.name || "Anonymous"}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium text-sm">
                            {app.company.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {app.university && (
                            <>
                              <GraduationCap className="h-3.5 w-3.5" />
                              <span>
                                {app.university.abbreviation || app.university.name}
                              </span>
                              {app.profile?.level && (
                                <span>• {app.profile.level}</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="flex items-center gap-4 text-xs flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 font-semibold tracking-wider uppercase border ${
                          INTERNSHIP_TYPE_COLORS[app.offer.internshipType] ?? ""
                        }`}
                      >
                        {INTERNSHIP_TYPE_LABELS[app.offer.internshipType] ??
                          app.offer.internshipType}
                      </span>

                      <span className="text-muted-foreground">
                        {app.offer.title}
                      </span>

                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {t("companyAcceptedOn")} {formatDate(app.companyActionAt)}
                      </span>
                    </div>

                    {/* Skills */}
                    {app.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {app.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill.id}
                            className="inline-flex items-center px-2 py-0.5 text-[10px] bg-primary/10 border border-primary/20 text-primary"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {app.skills.length > 5 && (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] text-muted-foreground">
                            +{app.skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
