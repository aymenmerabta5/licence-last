"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Building2, Loader2, MapPin, Search, X } from "lucide-react"

import { Link } from "@/i18n/routing"
import { orpc, orpcClient } from "@/server/orpc/client"
import { Button } from "@/components/ui/button"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

const STAGE_COLUMNS = [
  "applied",
  "screening",
  "interview",
  "offer",
  "accepted",
  "rejected",
] as const

type PipelineStage = (typeof STAGE_COLUMNS)[number]

const STAGE_LABELS: Record<PipelineStage, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  accepted: "Accepted",
  rejected: "Rejected",
}

const STATUS_COLORS: Record<string, string> = {
  applied:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  company_accepted:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  company_refused:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  admin_validated:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  admin_rejected:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  withdrawn:
    "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700",
}

export function ApplicationsClient() {
  const t = useTranslations("dashboard.applications")
  const locale = useLocale()
  const queryClient = useQueryClient()

  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  const [openedTimelineFor, setOpenedTimelineFor] = useState<string | null>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["applications", "listByStudent"],
    queryFn: async ({ pageParam }) =>
      orpcClient.applications.listByStudent({
        cursor: pageParam as { createdAt: string; id: string } | undefined,
        limit: 30,
      }),
    initialPageParam: undefined as { createdAt: string; id: string } | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const timelineQuery = useQuery({
    ...orpc.applications.getTimeline.queryOptions({
      input: { applicationId: openedTimelineFor ?? "" },
    }),
    enabled: !!openedTimelineFor,
  })

  const applications = useMemo(
    () => data?.pages.flatMap((p) => p.applications) ?? [],
    [data],
  )

  const withdrawMutation = useMutation(
    orpc.applications.withdraw.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["applications", "listByStudent"] })
        setWithdrawingId(null)
      },
      onError: () => setWithdrawingId(null),
    }),
  )

  const handleWithdraw = (applicationId: string) => {
    if (!window.confirm(t("withdrawConfirm"))) return
    setWithdrawingId(applicationId)
    withdrawMutation.mutate({ applicationId })
  }

  const groupedByStage = useMemo(() => {
    const groups = new Map<PipelineStage, typeof applications>()
    for (const stage of STAGE_COLUMNS) groups.set(stage, [])

    for (const app of applications) {
      const stage = (app.pipelineStage ?? "applied") as PipelineStage
      groups.get(stage)?.push(app)
    }

    return groups
  }, [applications])

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
    const observer = new IntersectionObserver(handleIntersection, { rootMargin: "200px" })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleIntersection])

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight">{t("title")} - Pipeline</h1>
        <p className="text-sm text-muted-foreground font-light mt-1">{t("subtitle")}</p>
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
          className="border border-dashed border-border p-12 text-center space-y-4"
        >
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
          <Link href={"/dashboard/explore" as "/dashboard"}>
            <Button variant="editorial" size="editorial" className="gap-2">
              <Search className="h-4 w-4" />
              {t("exploreOffers")}
            </Button>
          </Link>
        </motion.div>
      )}

      {applications.length > 0 && (
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3 min-w-[1120px]">
            {STAGE_COLUMNS.map((stage) => {
              const stageApps = groupedByStage.get(stage) ?? []
              return (
                <section
                  key={stage}
                  className="border border-border bg-secondary/10 p-3 space-y-3 min-h-[380px]"
                >
                  <header className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-heading">
                      {STAGE_LABELS[stage]}
                    </h2>
                    <span className="text-[10px] text-muted-foreground">{stageApps.length}</span>
                  </header>

                  <div className="space-y-2">
                    {stageApps.length === 0 && (
                      <p className="text-[11px] text-muted-foreground">No applications</p>
                    )}

                    {stageApps.map((app) => (
                      <article key={app.id} className="border border-border bg-background p-3 space-y-2">
                        <Link
                          href={`/dashboard/explore/${app.offerId}` as "/dashboard"}
                          className="hover:text-primary transition-colors"
                        >
                          <h3 className="font-serif text-sm text-heading leading-tight">{app.offerTitle}</h3>
                        </Link>

                        <div className="text-[11px] text-muted-foreground space-y-1">
                          <p className="inline-flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {app.companyName}
                          </p>
                          {app.offerWilayaCode && (
                            <p className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {String(app.offerWilayaCode).padStart(2, "0")}
                            </p>
                          )}
                        </div>

                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border ${STATUS_COLORS[app.status] ?? ""}`}
                        >
                          {t(`status.${app.status}` as "status.applied")}
                        </span>

                        <p className="text-[10px] text-muted-foreground">
                          {t("appliedOn")} {new Date(app.createdAt).toLocaleDateString(locale)}
                        </p>

                        <div className="flex items-center justify-between gap-2">
                          {app.status === "applied" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleWithdraw(app.id)}
                              disabled={withdrawingId === app.id}
                              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive gap-1"
                            >
                              {withdrawingId === app.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              {t("withdraw")}
                            </Button>
                          ) : (
                            <span />
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => setOpenedTimelineFor(app.id)}
                          >
                            Timeline
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      )}

      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {openedTimelineFor && (
        <div className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background border border-border p-6 max-w-lg w-full space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif text-lg text-heading">Application Timeline</h3>
              <Button variant="ghost" size="sm" onClick={() => setOpenedTimelineFor(null)}>
                Close
              </Button>
            </div>

            {timelineQuery.isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading timeline...
              </div>
            )}

            {!timelineQuery.isLoading && (timelineQuery.data?.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground">No timeline events yet.</p>
            )}

            {(timelineQuery.data ?? []).map((event) => (
              <div key={event.id} className="border border-border p-3">
                <p className="text-xs font-medium text-foreground">{event.eventType.replace(/_/g, " ")}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {new Date(event.createdAt).toLocaleString(locale)}
                </p>
                {event.fromStage && event.toStage && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {event.fromStage}
                    {" -> "}
                    {event.toStage}
                  </p>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  )
}
