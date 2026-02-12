"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import { DefaultChatTransport } from "ai"
import { useChat } from "@ai-sdk/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Building2,
  Calendar,
  Briefcase,
  Monitor,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import { asRecord, findLatestToolOutput, getStringProp } from "@/lib/ai/tool-output"
import { orpc } from "@/server/orpc/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

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

interface OfferDetailClientProps {
  offer: {
    id: string
    companyId: string
    title: string
    description: string
    internshipType: string
    workMode: string | null
    wilayaCode: number | null
    durationWeeks: number | null
    maxPositions: number
    closesAt: Date | null
    createdAt: Date
    companyName: string
    companySlug: string
    companyLogoUrl: string | null
    companyDescription: string | null
    companyWilayaCode: number | null
    companyAddress: string | null
    applicationCount: number
    skills: { id: string; name: string; slug: string; category: string | null }[]
  }
  existingApplication: {
    id: string
    status: string
    createdAt: Date
  } | null
  studentUserId: string
}

export function OfferDetailClient({
  offer,
  existingApplication,
  studentUserId,
}: OfferDetailClientProps) {
  const t = useTranslations("dashboard.offerDetail")
  const locale = useLocale()
  const statusT = useTranslations("dashboard.applications.status")

  const [showApplyForm, setShowApplyForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [coverLetterDraft, setCoverLetterDraft] = useState<string | null>(null)
  const [application, setApplication] = useState(existingApplication)
  const [successMsg, setSuccessMsg] = useState("")
  const hasCapturedReadinessRef = useRef(false)

  const aiActiveRef = useRef(false)

  const aiTransport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant/chat",
      }),
    [],
  )

  const {
    status: aiStatus,
    error: aiError,
    sendMessage: sendAiMessage,
    setMessages: setAiMessages,
  } = useChat({
    transport: aiTransport,
    onFinish: ({ messages }) => {
      if (!aiActiveRef.current) return
      aiActiveRef.current = false

      const out = asRecord(findLatestToolOutput(messages, "student_cover_letter_draft"))
      const coverLetter = getStringProp(out, "coverLetter")
      if (!coverLetter) return

      setCoverLetterDraft(coverLetter)
    },
  })

  const isOfferClosed = offer.closesAt && new Date(offer.closesAt) < new Date()

  const applyMutation = useMutation(
    orpc.applications.apply.mutationOptions({
      onSuccess: (data) => {
        setApplication({
          id: data.applicationId,
          status: "applied",
          createdAt: new Date(),
        })
        setShowApplyForm(false)
        setSuccessMsg(t("applicationSuccess"))
      },
    }),
  )

  const matchScoreQuery = useQuery(
    orpc.matching.getScore.queryOptions({
      input: { studentUserId, offerId: offer.id },
    }),
  )

  const skillGapQuery = useQuery(
    orpc.matching.getSkillGap.queryOptions({
      input: { studentUserId, offerId: offer.id },
    }),
  )

  const readinessHistoryQuery = useQuery(
    orpc.matching.getReadinessHistory.queryOptions({
      input: { studentUserId, offerId: offer.id, limit: 6 },
    }),
  )

  const trustIndexQuery = useQuery(
    orpc.companies.getTrustIndex.queryOptions({
      input: { companyId: offer.companyId },
    }),
  )

  const captureSnapshotMutation = useMutation(
    orpc.matching.captureReadinessSnapshot.mutationOptions(),
  )
  const captureReadinessSnapshot = captureSnapshotMutation.mutate
  const isCapturingReadiness = captureSnapshotMutation.isPending

  const companyInitial = offer.companyName.charAt(0).toUpperCase()
  const readinessPoints = readinessHistoryQuery.data?.points ?? []
  const latestReadiness = readinessPoints[0]?.readyPercent
  const previousReadiness = readinessPoints[1]?.readyPercent
  const readinessDelta =
    typeof latestReadiness === "number" && typeof previousReadiness === "number"
      ? latestReadiness - previousReadiness
      : null

  useEffect(() => {
    if (!hasCapturedReadinessRef.current && !isCapturingReadiness) {
      hasCapturedReadinessRef.current = true
      captureReadinessSnapshot({ offerId: offer.id, source: "offer_view" })
    }
  }, [
    captureReadinessSnapshot,
    isCapturingReadiness,
    offer.id,
  ])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back link */}
      <motion.div {...reveal} transition={{ duration: 0.4, ease }}>
        <Link
          href={"/dashboard/explore" as "/dashboard"}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Title section */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.5, ease, delay: 0.05 }}
            className="space-y-3"
          >
              <div className="flex items-start gap-4">
                {offer.companyLogoUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={offer.companyLogoUrl}
                      alt={offer.companyName}
                      className="h-12 w-12 rounded border border-border object-cover shrink-0"
                    />
                  </>
                ) : (
                  <div className="h-12 w-12 rounded border border-border bg-primary/10 flex items-center justify-center text-lg font-serif text-primary shrink-0">
                    {companyInitial}
                  </div>
                )}
              <div className="min-w-0">
                <h1 className="font-serif text-2xl lg:text-3xl text-heading tracking-tight">
                  {offer.title}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {offer.companyName}
                </p>
              </div>
            </div>

            {/* Type + work mode badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase border border-primary/20 bg-primary/10 text-primary">
                {t(`type.${offer.internshipType}` as "type.pfe")}
              </span>
              {offer.workMode && (
                <span className="inline-flex items-center px-2.5 py-1 text-[11px] tracking-wider uppercase border border-border text-muted-foreground">
                  {t(`workModeLabel.${offer.workMode}` as "workModeLabel.on_site")}
                </span>
              )}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
            className="space-y-3"
          >
            <h2 className="font-serif text-lg text-heading">{t("description")}</h2>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {offer.description}
            </div>
          </motion.div>

          {/* Skills */}
          {offer.skills.length > 0 && (
            <motion.div
              {...reveal}
              transition={{ duration: 0.5, ease, delay: 0.15 }}
              className="space-y-3"
            >
              <h2 className="font-serif text-lg text-heading">
                {t("requiredSkills")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {offer.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center px-2.5 py-1 text-xs bg-primary/10 border border-primary/20 text-primary"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <motion.aside
          {...reveal}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          className="lg:w-80 shrink-0 space-y-6"
        >
          {/* Details card */}
          <div className="border border-border p-5 space-y-4">
            <h3 className="font-serif text-base text-heading">{t("details")}</h3>

            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                <dt className="text-muted-foreground">{t("internshipType")}:</dt>
                <dd className="font-medium ms-auto">
                  {t(`type.${offer.internshipType}` as "type.pfe")}
                </dd>
              </div>

              {offer.workMode && (
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground shrink-0" />
                  <dt className="text-muted-foreground">{t("workMode")}:</dt>
                  <dd className="font-medium ms-auto">
                    {t(`workModeLabel.${offer.workMode}` as "workModeLabel.on_site")}
                  </dd>
                </div>
              )}

              {offer.wilayaCode && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <dt className="text-muted-foreground">{t("location")}:</dt>
                  <dd className="font-medium ms-auto">
                    {String(offer.wilayaCode).padStart(2, "0")}
                  </dd>
                </div>
              )}

              {offer.durationWeeks && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <dt className="text-muted-foreground">{t("duration")}:</dt>
                  <dd className="font-medium ms-auto">
                    {offer.durationWeeks} {t("weeks")}
                  </dd>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <dt className="text-muted-foreground">{t("positions")}:</dt>
                <dd className="font-medium ms-auto">{offer.maxPositions}</dd>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <dt className="text-muted-foreground">{t("deadline")}:</dt>
                <dd className="font-medium ms-auto">
                  {offer.closesAt
                    ? new Date(offer.closesAt).toLocaleDateString(locale)
                    : t("noDeadline")}
                </dd>
              </div>
            </dl>
          </div>

          {/* Application state / Apply button */}
          <div className="border border-border p-5 space-y-4">
            {successMsg && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                {successMsg}
              </div>
            )}

            {application ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("alreadyApplied")}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {t("applicationStatus")}:
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border ${STATUS_COLORS[application.status] ?? ""}`}
                  >
                    {statusT(application.status as "applied")}
                  </span>
                </div>
              </div>
            ) : isOfferClosed ? (
              <p className="text-sm text-muted-foreground">{t("offerClosed")}</p>
            ) : showApplyForm ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coverLetter" className="text-sm">
                    {t("coverLetter")}
                  </Label>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={aiStatus !== "ready"}
                      onClick={() => {
                        aiActiveRef.current = true
                        setCoverLetterDraft(null)
                        setAiMessages([])

                        const context = {
                          intent: "student_cover_letter_draft",
                          offer: {
                            title: offer.title,
                            description: offer.description,
                            internshipType: offer.internshipType,
                            workMode: offer.workMode,
                            wilayaCode: offer.wilayaCode,
                            durationWeeks: offer.durationWeeks,
                            skills: offer.skills.map((s) => ({
                              id: s.id,
                              name: s.name,
                              category: s.category ?? null,
                            })),
                          },
                          company: {
                            name: offer.companyName,
                            description: offer.companyDescription,
                            address: offer.companyAddress,
                          },
                          currentCoverLetter: coverLetter || null,
                        }

                        void sendAiMessage(
                          { text: t("copilot.prompts.draftCoverLetter") },
                          { body: { context } },
                        )
                      }}
                    >
                      <Sparkles className="h-4 w-4" />
                      {t("copilot.draftWithAi")}
                    </Button>
                    <p className="text-[11px] text-muted-foreground">{t("copilot.aiStatus", { status: aiStatus })}</p>
                  </div>

                  <Textarea
                    id="coverLetter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder={t("coverLetterPlaceholder")}
                    rows={6}
                    maxLength={5000}
                  />

                  {aiError && <p className="text-xs text-destructive">{aiError.message}</p>}

                  {coverLetterDraft && (
                    <div className="border border-border bg-primary/5 p-3 rounded-none space-y-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t("copilot.previewTitle")}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {coverLetterDraft}
                      </p>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="editorial"
                          size="editorial"
                          className="h-9"
                          onClick={() => setCoverLetter(coverLetterDraft)}
                        >
                          {t("copilot.applyDraft")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {applyMutation.error && (
                  <p className="text-sm text-destructive">
                    {applyMutation.error.message || t("applicationError")}
                  </p>
                )}

                <Button
                  onClick={() =>
                    applyMutation.mutate({
                      offerId: offer.id,
                      coverLetter: coverLetter || undefined,
                    })
                  }
                  disabled={applyMutation.isPending}
                  variant="editorial"
                  size="editorial"
                  className="w-full gap-2"
                >
                  {applyMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("submitting")}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t("submitApplication")}
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowApplyForm(true)}
                variant="editorial"
                size="editorial"
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                {t("applyNow")}
              </Button>
            )}
          </div>

          {/* Why this match */}
          <div className="border border-border p-5 space-y-4">
            <h3 className="font-serif text-base text-heading">Why this match?</h3>
            {matchScoreQuery.isLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Computing fit score...
              </div>
            ) : matchScoreQuery.data ? (
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <p className="font-serif text-3xl text-heading tabular-nums">
                    {matchScoreQuery.data.score}
                    <span className="text-base text-muted-foreground">/100</span>
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {matchScoreQuery.data.version}
                  </p>
                </div>

                <div className="space-y-2">
                  {matchScoreQuery.data.reasons.slice(0, 3).map((reason) => (
                    <div key={reason.key} className="text-xs">
                      <p className="font-medium text-foreground">{reason.title}</p>
                      <p className="text-muted-foreground">{reason.detail}</p>
                    </div>
                  ))}
                </div>

                {skillGapQuery.data && skillGapQuery.data.missingSkills.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Missing skills roadmap
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {skillGapQuery.data.missingSkills.slice(0, 5).map((skill) => (
                        <span
                          key={skill.id}
                          className="inline-flex items-center px-2 py-0.5 text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Estimated improvement: +{skillGapQuery.data.estimatedDelta}% readiness
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-border space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Readiness trend
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Latest: {latestReadiness ?? matchScoreQuery.data.readinessPercent}%
                    {readinessDelta !== null && (
                      <span className={readinessDelta >= 0 ? "text-green-600 ms-1" : "text-red-600 ms-1"}>
                        ({readinessDelta >= 0 ? "+" : ""}{readinessDelta}%)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Score unavailable right now.</p>
            )}
          </div>

          {/* Company info card */}
          <div className="border border-border p-5 space-y-3">
            <h3 className="font-serif text-base text-heading">
              {t("aboutCompany")}
            </h3>
            {trustIndexQuery.data && (
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider">
                <span className="text-muted-foreground">Trust index</span>
                <span className="font-semibold text-heading">{trustIndexQuery.data.trustScore}/100</span>
                <span className="text-muted-foreground">({trustIndexQuery.data.tier})</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              {offer.companyLogoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={offer.companyLogoUrl}
                    alt={offer.companyName}
                    className="h-10 w-10 rounded border border-border object-cover"
                  />
                </>
              ) : (
                <div className="h-10 w-10 rounded border border-border bg-primary/10 flex items-center justify-center text-base font-serif text-primary">
                  {companyInitial}
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{offer.companyName}</p>
                {offer.companyWilayaCode && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {String(offer.companyWilayaCode).padStart(2, "0")}
                    {offer.companyAddress && ` - ${offer.companyAddress}`}
                  </p>
                )}
              </div>
            </div>
            {offer.companyDescription && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {offer.companyDescription}
              </p>
            )}
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
