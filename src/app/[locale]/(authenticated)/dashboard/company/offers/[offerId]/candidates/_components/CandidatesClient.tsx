"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Check,
  GraduationCap,
  Loader2,
  Users,
  X,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import { orpc, orpcClient } from "@/server/orpc/client"
import { Button } from "@/components/ui/button"
import type { ListApplicationsByOfferResult } from "@/server/services/applications/list-by-offer"

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
    "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700",
}

interface CandidatesClientProps {
  offerId: string
}

function MatchPreview({
  offerId,
  studentUserId,
}: {
  offerId: string
  studentUserId: string
}) {
  const query = useQuery(
    orpc.matching.getScore.queryOptions({
      input: { offerId, studentUserId },
    }),
  )

  if (query.isLoading) {
    return (
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Scoring...
      </div>
    )
  }

  if (!query.data) return null

  return (
    <div className="space-y-1.5 border-t border-border pt-2">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
        Fit score <span className="text-foreground font-semibold">{query.data.score}/100</span>
      </p>
      {query.data.reasons.slice(0, 2).map((reason) => (
        <p key={reason.key} className="text-[11px] text-muted-foreground">
          <span className="text-foreground font-medium">{reason.title}:</span> {reason.detail}
        </p>
      ))}
    </div>
  )
}

export function CandidatesClient({ offerId }: CandidatesClientProps) {
  const t = useTranslations("dashboard.company.candidates")
  const locale = useLocale()
  const queryClient = useQueryClient()

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [refuseModal, setRefuseModal] = useState<{
    applicationId: string
    studentName: string
  } | null>(null)
  const [refuseNote, setRefuseNote] = useState("")
  const [openedTimelineFor, setOpenedTimelineFor] = useState<string | null>(null)

  const safeOfferId = offerId

  const { data: offer, isLoading: offerLoading } = useQuery({
    ...orpc.offers.getById.queryOptions({ input: { offerId: safeOfferId } }),
    enabled: !!safeOfferId,
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: applicationsLoading,
  } = useInfiniteQuery<ListApplicationsByOfferResult>({
    queryKey: ["applications", "listByOffer", safeOfferId],
    queryFn: async ({ pageParam }) =>
      orpcClient.applications.listByOffer({
        offerId: safeOfferId,
        cursor: pageParam as { createdAt: string; id: string } | undefined,
        limit: 24,
      }),
    enabled: !!safeOfferId,
    initialPageParam: undefined as { createdAt: string; id: string } | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const applications = data?.pages.flatMap((page) => page.applications) ?? []

  const timelineQuery = useQuery({
    ...orpc.applications.getTimeline.queryOptions({
      input: { applicationId: openedTimelineFor ?? "" },
    }),
    enabled: !!openedTimelineFor,
  })

  const stageMutation = useMutation(
    orpc.applications.updatePipelineStage.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["applications", "listByOffer", safeOfferId] })
      },
    }),
  )

  const acceptMutation = useMutation(
    orpc.applications.companyAccept.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["applications", "listByOffer", safeOfferId] })
        queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
        setActionLoading(null)
      },
      onError: () => setActionLoading(null),
    }),
  )

  const refuseMutation = useMutation(
    orpc.applications.companyRefuse.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["applications", "listByOffer", safeOfferId] })
        queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
        setActionLoading(null)
        setRefuseModal(null)
        setRefuseNote("")
      },
      onError: () => setActionLoading(null),
    }),
  )

  const handleAccept = (applicationId: string) => {
    if (!window.confirm(t("confirmAccept"))) return
    setActionLoading(applicationId)
    acceptMutation.mutate({ applicationId })
  }

  const handleRefuse = () => {
    if (!refuseModal) return
    setActionLoading(refuseModal.applicationId)
    refuseMutation.mutate({
      applicationId: refuseModal.applicationId,
      note: refuseNote || undefined,
    })
  }

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

  const isLoading = offerLoading || applicationsLoading || !safeOfferId

  const grouped = new Map<PipelineStage, typeof applications>()
  for (const stage of STAGE_COLUMNS) {
    grouped.set(stage, [])
  }
  for (const app of applications) {
    const stage = (app.pipelineStage ?? "applied") as PipelineStage
    grouped.get(stage)?.push(app)
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <Link
          href={"/dashboard/company/offers" as "/dashboard"}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("backToOffers")}
        </Link>

        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-heading tracking-tight">
            {t("title")} - Pipeline
          </h1>
          {offer && <p className="text-sm text-muted-foreground font-light">{offer.title}</p>}
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
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </motion.div>
      )}

      {!isLoading && applications.length > 0 && (
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3 min-w-[1120px]">
            {STAGE_COLUMNS.map((stage) => {
              const stageApps = grouped.get(stage) ?? []
              return (
                <section
                  key={stage}
                  className="border border-border bg-secondary/10 p-3 space-y-3 min-h-[420px]"
                >
                  <header className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold tracking-wider uppercase text-heading">
                      {STAGE_LABELS[stage]}
                    </h2>
                    <span className="text-[10px] text-muted-foreground">{stageApps.length}</span>
                  </header>

                  <div className="space-y-2">
                    {stageApps.length === 0 && (
                      <p className="text-[11px] text-muted-foreground">No applications</p>
                    )}

                    {stageApps.map((app) => (
                      <article key={app.id} className="border border-border bg-background p-3 space-y-3">
                        <div className="space-y-1">
                          <p className="font-medium text-sm text-heading">{app.student.name || "Anonymous"}</p>
                          {app.university && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {app.university.abbreviation || app.university.name}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border ${STATUS_COLORS[app.status] ?? ""}`}
                          >
                            {app.status.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(app.createdAt).toLocaleDateString(locale)}
                          </span>
                        </div>

                        <MatchPreview
                          offerId={safeOfferId}
                          studentUserId={app.student.id}
                        />

                        <label className="block space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Pipeline Stage
                          </span>
                          <select
                            value={app.pipelineStage}
                            onChange={(event) =>
                              stageMutation.mutate({
                                applicationId: app.id,
                                toStage: event.target.value as PipelineStage,
                              })
                            }
                            disabled={
                              stageMutation.isPending ||
                              app.pipelineStage === "accepted" ||
                              app.pipelineStage === "rejected"
                            }
                            className="w-full h-8 border border-border bg-background px-2 text-xs"
                          >
                            {STAGE_COLUMNS.map((option) => (
                              <option
                                key={option}
                                value={option}
                                disabled={option === "accepted"}
                              >
                                {STAGE_LABELS[option]}
                              </option>
                            ))}
                          </select>
                        </label>

                        {app.status === "applied" && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="h-7 text-[11px] gap-1.5 bg-green-600 hover:bg-green-700"
                              onClick={() => handleAccept(app.id)}
                              disabled={actionLoading === app.id}
                            >
                              {actionLoading === app.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              {t("accept")}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() =>
                                setRefuseModal({
                                  applicationId: app.id,
                                  studentName: app.student.name || "Student",
                                })
                              }
                            >
                              <X className="h-3 w-3" />
                              {t("refuse")}
                            </Button>
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] px-0"
                          onClick={() => setOpenedTimelineFor(app.id)}
                        >
                          View timeline
                        </Button>
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
              <h3 className="font-serif text-lg text-heading">Timeline</h3>
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

      {refuseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background border border-border p-6 max-w-md w-full space-y-4"
          >
            <h3 className="font-serif text-lg text-heading">{t("refuseTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("refuseDescription", { name: refuseModal.studentName })}
            </p>
            <textarea
              value={refuseNote}
              onChange={(event) => setRefuseNote(event.target.value)}
              placeholder={t("refuseNotePlaceholder")}
              className="w-full min-h-[80px] px-3 py-2 text-sm border border-border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRefuseModal(null)
                  setRefuseNote("")
                }}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRefuse}
                disabled={actionLoading === refuseModal.applicationId}
              >
                {actionLoading === refuseModal.applicationId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("confirmRefuse")
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
