"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import { DefaultChatTransport } from "ai"
import { useChat } from "@ai-sdk/react"
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Users,
  Loader2,
  Check,
  X,
  Github,
  Globe,
  GraduationCap,
  Sparkles,
  Wand2,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import {
  asRecord,
  findLatestToolOutput,
  getString,
  getStringArray,
} from "@/lib/ai/tool-output"
import { orpc, orpcClient } from "@/server/orpc/client"
import { Button } from "@/components/ui/button"
import type { ListApplicationsByOfferResult } from "@/server/services/applications/list-by-offer"

import { StudentProfileView } from "@/app/[locale]/(authenticated)/dashboard/company/_components/StudentProfileView"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

const STATUS_TABS = ["all", "applied", "company_accepted", "company_refused"] as const
type StatusFilter = (typeof STATUS_TABS)[number]

const STATUS_COLORS: Record<string, string> = {
  applied:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  company_accepted:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  company_refused:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
}

const MATCH_COLORS: Record<string, string> = {
  high: "text-green-600 dark:text-green-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-red-600 dark:text-red-400",
}

type CandidateCopilotIntent = "candidate_summarize" | "candidate_draft_refusal_note"

type CandidateSummary = {
  summary: string
  strengths: string[]
  concerns: string[]
  followUps: string[]
}

function getMatchLevel(percentage: number): string {
  if (percentage >= 70) return "high"
  if (percentage >= 40) return "medium"
  return "low"
}

interface CandidatesClientProps {
  offerId: string
}

export function CandidatesClient({ offerId }: CandidatesClientProps) {
  const t = useTranslations("dashboard.company.candidates")
  const locale = useLocale()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<StatusFilter>("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [refuseModal, setRefuseModal] = useState<{
    applicationId: string
    studentName: string
  } | null>(null)
  const [refuseNote, setRefuseNote] = useState("")

  const [aiActive, setAiActive] = useState<
    | { intent: CandidateCopilotIntent; applicationId: string }
    | null
  >(null)
  const [candidateSummaries, setCandidateSummaries] = useState<Record<string, CandidateSummary>>({})

  const aiActiveRef = useRef<
    | { intent: CandidateCopilotIntent; applicationId: string }
    | null
  >(null)

  const setAiActiveWithRef = (next: { intent: CandidateCopilotIntent; applicationId: string } | null) => {
    aiActiveRef.current = next
    setAiActive(next)
  }

  const aiTransport = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant/chat",
      }),
  )[0]

  const {
    status: aiStatus,
    error: aiError,
    sendMessage: sendAiMessage,
    setMessages: setAiMessages,
  } = useChat({
    transport: aiTransport,
    onFinish: ({ messages }) => {
      const active = aiActiveRef.current
      if (!active) return

      const output = findLatestToolOutput(messages, active.intent)
      const record = asRecord(output)
      if (!record) return

      if (active.intent === "candidate_summarize") {
        const summary = getString(record.summary)
        if (!summary) return

        setCandidateSummaries((prev) => ({
          ...prev,
          [active.applicationId]: {
            summary,
            strengths: getStringArray(record.strengths),
            concerns: getStringArray(record.concerns),
            followUps: getStringArray(record.followUps),
          },
        }))
        setAiActiveWithRef(null)
        return
      }

      if (active.intent === "candidate_draft_refusal_note") {
        const note = getString(record.note)
        if (!note) return
        setRefuseNote(note)
        setAiActiveWithRef(null)
      }
    },
  })

  const safeOfferId = offerId

  const statusParam =
    activeTab === "all" ? undefined : (activeTab as "applied" | "company_accepted" | "company_refused")

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
    queryKey: ["applications", "listByOffer", safeOfferId, activeTab],
    queryFn: async ({ pageParam }) => {
      return orpcClient.applications.listByOffer({
        offerId: safeOfferId,
        status: statusParam,
        cursor: pageParam as { createdAt: string; id: string } | undefined,
        limit: 10,
      })
    },
    enabled: !!safeOfferId,
    initialPageParam: undefined as { createdAt: string; id: string } | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const applications = data?.pages.flatMap((p) => p.applications) ?? []

  const acceptMutation = useMutation(
    orpc.applications.companyAccept.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["applications", "listByOffer"] })
        queryClient.invalidateQueries({ queryKey: orpc.offers.listByCompany.queryOptions().queryKey })
        setActionLoading(null)
      },
      onError: () => {
        setActionLoading(null)
      },
    }),
  )

  const refuseMutation = useMutation(
    orpc.applications.companyRefuse.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["applications", "listByOffer"] })
        queryClient.invalidateQueries({ queryKey: orpc.offers.listByCompany.queryOptions().queryKey })
        setRefuseModal(null)
        setRefuseNote("")
        setActionLoading(null)
      },
      onError: () => {
        setActionLoading(null)
      },
    }),
  )

  const handleAccept = async (applicationId: string) => {
    if (!window.confirm(t("confirmAccept"))) return
    setActionLoading(applicationId)
    acceptMutation.mutate({ applicationId })
  }

  const handleRefuse = async () => {
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
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "200px",
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleIntersection])

  const isLoading = offerLoading || applicationsLoading || !safeOfferId

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
            {t("title")}
          </h1>
          {offer && (
            <p className="text-sm text-muted-foreground font-light">
              {offer.title}
            </p>
          )}
        </div>
      </motion.div>

      <motion.div
        {...reveal}
        transition={{ duration: 0.5, ease, delay: 0.05 }}
        className="flex flex-wrap gap-1.5"
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-200 border ${
              activeTab === tab
                ? "bg-primary text-white border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-primary/30 hover:text-primary"
            }`}
          >
            {t(`statusFilter.${tab}`)}
          </button>
        ))}
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
          <p className="text-sm text-muted-foreground">
            {activeTab === "all" ? t("empty") : t("emptyFiltered")}
          </p>
        </motion.div>
      )}

      {applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((app, i) => (
            <motion.div
              key={app.id}
              {...reveal}
              transition={{ duration: 0.4, ease, delay: 0.03 * i }}
              className="border border-border p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {app.student.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <Link
                        href={`/profile/${app.student.id}` as "/profile"}
                        className="font-serif text-lg text-heading hover:text-primary transition-colors"
                      >
                        {app.student.name || "Anonymous"}
                      </Link>
                      {app.university && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {app.university.abbreviation || app.university.name}
                          {app.profile?.level && ` • ${app.profile.level}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border ${STATUS_COLORS[app.status] ?? ""}`}
                    >
                      {t(`status.${app.status}`)}
                    </span>

                    <span
                      className={`text-xs font-medium ${MATCH_COLORS[getMatchLevel(app.skillMatchPercentage)]}`}
                    >
                      {app.skillMatchPercentage}% {t("skillMatch")}
                    </span>

                    {app.profile?.githubUrl && (
                      <a
                        href={app.profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Github className="h-3.5 w-3.5" />
                        GitHub
                      </a>
                    )}

                    {app.profile?.portfolioUrl && (
                      <a
                        href={app.profile.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        {t("portfolio")}
                      </a>
                    )}
                  </div>

                  {app.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {app.skills.slice(0, 6).map((skill) => (
                        <span
                          key={skill.id}
                          className="inline-flex items-center px-2 py-0.5 text-[10px] bg-primary/10 border border-primary/20 text-primary"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {app.skills.length > 6 && (
                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] text-muted-foreground">
                          +{app.skills.length - 6}
                        </span>
                      )}
                    </div>
                  )}

                  {app.coverLetter && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        {t("coverLetter")}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {app.coverLetter}
                      </p>
                    </div>
                  )}

                  {candidateSummaries[app.id] && (
                    <div className="pt-2 border-t border-border space-y-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t("ai.summaryTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {candidateSummaries[app.id].summary}
                      </p>
                      {candidateSummaries[app.id].strengths.length > 0 && (
                        <p className="text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground">{t("ai.strengths")}:</span>{" "}
                          {candidateSummaries[app.id].strengths.join(", ")}
                        </p>
                      )}
                      {candidateSummaries[app.id].concerns.length > 0 && (
                        <p className="text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground">{t("ai.concerns")}:</span>{" "}
                          {candidateSummaries[app.id].concerns.join(", ")}
                        </p>
                      )}
                      {candidateSummaries[app.id].followUps.length > 0 && (
                        <p className="text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground">{t("ai.followUps")}:</span>{" "}
                          {candidateSummaries[app.id].followUps.join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground">
                    {t("appliedOn")} {new Date(app.createdAt).toLocaleDateString(locale)}
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <StudentProfileView
                    studentUserId={app.student.id}
                    label={t("viewProfile")}
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    disabled={aiStatus !== "ready"}
                    onClick={() => {
                      if (!offer) return
                      setAiActiveWithRef({ intent: "candidate_summarize", applicationId: app.id })
                      setAiMessages([])

                      const context = {
                        intent: "candidate_summarize",
                        offer: {
                          title: offer.title,
                          skills: offer.skills.map((s) => ({
                            id: s.id,
                            name: s.name,
                            category: s.category ?? null,
                          })),
                        },
                        applicant: {
                          name: app.student.name,
                          skills: app.skills.map((s) => ({
                            id: s.id,
                            name: s.name,
                            category: s.category ?? null,
                          })),
                          coverLetter: app.coverLetter ?? "",
                        },
                      }

                      void sendAiMessage(
                        { text: t("ai.prompts.summarize") },
                        { body: { context } },
                      )
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {t("ai.summarize")}
                  </Button>

                  {app.status === "applied" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1.5 text-xs bg-green-600 hover:bg-green-700"
                        onClick={() => handleAccept(app.id)}
                        disabled={actionLoading === app.id}
                      >
                        {actionLoading === app.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        {t("accept")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() =>
                          setRefuseModal({
                            applicationId: app.id,
                            studentName: app.student.name || "Student",
                          })
                        }
                        disabled={actionLoading === app.id}
                      >
                        <X className="h-3.5 w-3.5" />
                        {t("refuse")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
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
              onChange={(e) => setRefuseNote(e.target.value)}
              placeholder={t("refuseNotePlaceholder")}
              className="w-full min-h-[80px] px-3 py-2 text-sm border border-border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />

            {aiError && <p className="text-xs text-destructive">{aiError.message}</p>}
            {aiActive?.intent === "candidate_draft_refusal_note" && (
              <p className="text-xs text-muted-foreground">{t("ai.draftingNote")}</p>
            )}

            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={aiStatus !== "ready"}
                onClick={() => {
                  if (!offer) return
                  setAiActiveWithRef({
                    intent: "candidate_draft_refusal_note",
                    applicationId: refuseModal.applicationId,
                  })
                  setAiMessages([])

                  const context = {
                    intent: "candidate_draft_refusal_note",
                    offer: {
                      title: offer.title,
                    },
                    applicant: {
                      name: refuseModal.studentName,
                    },
                  }

                  void sendAiMessage(
                    { text: t("ai.prompts.refusalNote") },
                    { body: { context } },
                  )
                }}
              >
                <Wand2 className="h-3.5 w-3.5" />
                {t("ai.draftRefusalWithAi")}
              </Button>
              <p className="text-[11px] text-muted-foreground">{t("ai.aiStatus", { status: aiStatus })}</p>
            </div>

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
