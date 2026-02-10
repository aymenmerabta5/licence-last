"use client"

import { useRef, useState } from "react"
import * as motion from "motion/react-client"
import { useLocale, useTranslations } from "next-intl"
import { DefaultChatTransport } from "ai"
import { useChat } from "@ai-sdk/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Loader2,
  Check,
  X,
  Building2,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react"

import { Link, useRouter } from "@/i18n/routing"
import {
  asRecord,
  findLatestToolOutput,
  getStringArray,
} from "@/lib/ai/tool-output"
import { orpc, orpcClient } from "@/server/orpc/client"
import { Button } from "@/components/ui/button"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

type AdminValidationSummary = {
  summaryBullets: string[]
  checklist: string[]
  potentialInconsistencies: string[]
}

function formatDate(date: Date | string | null, locale: string, fallback: string): string {
  if (!date) return fallback
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function PlacementDetailClient({ applicationId }: { applicationId: string }) {
  const t = useTranslations("dashboard.admin.validations.detail")
  const locale = useLocale()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const [aiSummary, setAiSummary] = useState<AdminValidationSummary | null>(null)
  const aiActiveRef = useRef(false)

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
      if (!aiActiveRef.current) return
      const output = findLatestToolOutput(messages, "admin_validation_summary")
      const record = asRecord(output)
      if (!record) return

      setAiSummary({
        summaryBullets: getStringArray(record.summaryBullets),
        checklist: getStringArray(record.checklist),
        potentialInconsistencies: getStringArray(record.potentialInconsistencies),
      })
      aiActiveRef.current = false
    },
  })

  const safeApplicationId = applicationId

  // Fetch pending applications and find the one we need
  const { data, isLoading } = useQuery({
    ...orpc.placements.listPending.queryOptions({}),
    enabled: !!safeApplicationId,
  })

  const application = data?.applications.find((app) => app.id === safeApplicationId)

  const validateMutation = useMutation(
    orpc.placements.validate.mutationOptions({
      onSuccess: async (result) => {
        // Generate PDF after validation
        try {
          setPdfLoading(true)
          await orpcClient.documents.generateAgreement({
            placementId: result.placementId,
          })
        } catch (error) {
          console.error("Failed to generate PDF:", error)
        } finally {
          setPdfLoading(false)
        }
        
        queryClient.invalidateQueries({ queryKey: ["placements", "listPending"] })
        router.push("/dashboard/admin/validations")
      },
      onError: () => {
        setActionLoading(false)
      },
    }),
  )

  const rejectMutation = useMutation(
    orpc.placements.reject.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["placements", "listPending"] })
        router.push("/dashboard/admin/validations")
      },
      onError: () => {
        setActionLoading(false)
      },
    }),
  )

  const handleValidate = async () => {
    if (!startDate || !endDate) {
      alert(t("selectDates"))
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      alert(t("invalidDates"))
      return
    }

    if (!window.confirm(t("confirmValidate"))) return

    setActionLoading(true)
    validateMutation.mutate({
      applicationId,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    })
  }

  const handleReject = async () => {
    setActionLoading(true)
    rejectMutation.mutate({
      applicationId,
      reason: rejectReason || undefined,
    })
  }

  const isLoading_ = isLoading || !safeApplicationId

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <Link
          href={"/dashboard/admin/validations" as "/dashboard"}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("backToList")}
        </Link>

        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-heading tracking-tight">
            {t("title")}
          </h1>
          {application && (
            <p className="text-sm text-muted-foreground font-light">
              {application.student.name} → {application.company.name}
            </p>
          )}
        </div>
      </motion.div>

      {isLoading_ && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading_ && !application && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="border border-dashed border-border p-12 text-center space-y-2"
        >
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">{t("notFound")}</p>
        </motion.div>
      )}

      {application && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Info */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
            className="border border-border p-6 space-y-4"
          >
            <h2 className="font-serif text-lg text-heading flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("studentInfo")}
            </h2>
            <div className="space-y-3 text-sm">
              <InfoRow label={t("name")} value={application.student.name} />
              <InfoRow label={t("email")} value={application.student.email} icon={<Mail className="h-3.5 w-3.5" />} />
              {application.profile?.phone && (
                <InfoRow label={t("phone")} value={application.profile.phone} icon={<Phone className="h-3.5 w-3.5" />} />
              )}
              {application.profile?.studentNumber && (
                <InfoRow label={t("studentNumber")} value={application.profile.studentNumber} />
              )}
              {application.profile?.department && (
                <InfoRow label={t("department")} value={application.profile.department} />
              )}
              {application.profile?.level && (
                <InfoRow label={t("level")} value={application.profile.level} />
              )}
            </div>

            {/* University Info */}
            {application.university && (
              <div className="pt-4 border-t border-border space-y-3">
                <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {t("university")}
                </h3>
                <div className="space-y-2 text-sm">
                  <InfoRow label={t("name")} value={application.university.name} />
                  {application.university.departmentName && (
                    <InfoRow label={t("department")} value={application.university.departmentName} />
                  )}
                  {application.university.deanName && (
                    <InfoRow label={t("dean")} value={application.university.deanName} />
                  )}
                  {application.university.address && (
                    <InfoRow label={t("address")} value={application.university.address} icon={<MapPin className="h-3.5 w-3.5" />} />
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {application.skills.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  {t("skills")}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {application.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center px-2 py-0.5 text-[10px] bg-primary/10 border border-primary/20 text-primary"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Company & Offer Info */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.5, ease, delay: 0.15 }}
            className="border border-border p-6 space-y-4"
          >
            <h2 className="font-serif text-lg text-heading flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t("companyInfo")}
            </h2>
            <div className="space-y-3 text-sm">
              <InfoRow label={t("companyName")} value={application.company.name} />
              {application.company.address && (
                <InfoRow label={t("address")} value={application.company.address} icon={<MapPin className="h-3.5 w-3.5" />} />
              )}
              {application.company.phone && (
                <InfoRow label={t("phone")} value={application.company.phone} icon={<Phone className="h-3.5 w-3.5" />} />
              )}
              {application.company.representativeName && (
                <InfoRow label={t("representative")} value={application.company.representativeName} />
              )}
              {application.company.contactEmail && (
                <InfoRow label={t("email")} value={application.company.contactEmail} icon={<Mail className="h-3.5 w-3.5" />} />
              )}
            </div>

            {/* Offer Details */}
            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
                {t("offerDetails")}
              </h3>
              <div className="space-y-2 text-sm">
                <InfoRow label={t("title")} value={application.offer.title} />
                <InfoRow
                  label={t("type")}
                  value={t(`internshipTypeLabel.${application.offer.internshipType}` as "internshipTypeLabel.pfe")}
                />
                {application.offer.workMode && (
                  <InfoRow
                    label={t("workMode")}
                    value={t(`workModeLabel.${application.offer.workMode}` as "workModeLabel.on_site")}
                  />
                )}
                {application.offer.durationWeeks && (
                  <InfoRow
                    label={t("duration")}
                    value={t("durationWeeks", { count: application.offer.durationWeeks })}
                  />
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                {t("timeline")}
              </h3>
              <div className="text-xs text-muted-foreground">
                <p>
                  {t("appliedOn")}: {formatDate(application.createdAt, locale, t("notAvailable"))}
                </p>
                <p>
                  {t("companyAcceptedOn")}: {formatDate(application.companyActionAt, locale, t("notAvailable"))}
                </p>
              </div>
            </div>

            {/* Cover Letter */}
            {application.coverLetter && (
              <div className="pt-4 border-t border-border">
                <h3 className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {t("coverLetter")}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-4">
                  {application.coverLetter}
                </p>
              </div>
            )}
          </motion.div>

          {/* AI Summary */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.5, ease, delay: 0.18 }}
            className="lg:col-span-2 border border-border p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-serif text-lg text-heading flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t("ai.title")}
                </h2>
                <p className="text-sm text-muted-foreground font-light">
                  {t("ai.description")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={aiStatus !== "ready"}
                onClick={() => {
                  aiActiveRef.current = true
                  setAiSummary(null)
                  setAiMessages([])

                  const context = {
                    intent: "admin_validation_summary",
                    application: {
                      id: application.id,
                      createdAt: application.createdAt,
                      companyActionAt: application.companyActionAt,
                      coverLetter: application.coverLetter,
                      student: {
                        name: application.student?.name ?? null,
                      },
                      profile: {
                        level: application.profile?.level ?? null,
                        department: application.profile?.department ?? null,
                      },
                      university: application.university
                        ? {
                            name: application.university.name ?? null,
                            abbreviation: application.university.abbreviation ?? null,
                          }
                        : null,
                      offer: {
                        title: application.offer?.title ?? null,
                        internshipType: application.offer?.internshipType ?? null,
                        workMode: application.offer?.workMode ?? null,
                        wilayaCode: application.offer?.wilayaCode ?? null,
                        durationWeeks: application.offer?.durationWeeks ?? null,
                      },
                      company: {
                        name: application.company?.name ?? null,
                      },
                      skills: application.skills.map((s) => ({
                        id: s.id,
                        name: s.name,
                        category: s.category ?? null,
                      })),
                      selectedStartDate: startDate || null,
                      selectedEndDate: endDate || null,
                    },
                  }

                  void sendAiMessage(
                    { text: t("ai.prompt") },
                    { body: { context } },
                  )
                }}
              >
                {aiStatus === "ready" ? <Sparkles className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                {t("ai.generate")}
              </Button>
            </div>

            {aiError && <p className="text-xs text-destructive">{aiError.message}</p>}

            {aiSummary ? (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t("ai.summary")}
                  </p>
                  <ul className="list-disc ps-5 text-sm text-muted-foreground space-y-1">
                    {aiSummary.summaryBullets.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("ai.checklist")}
                    </p>
                    {aiSummary.checklist.length === 0 ? (
                      <p className="text-xs text-muted-foreground">{t("ai.noMissingItems")}</p>
                    ) : (
                      <ul className="list-disc ps-5 text-sm text-muted-foreground space-y-1">
                        {aiSummary.checklist.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {aiSummary.potentialInconsistencies.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t("ai.potentialInconsistencies")}
                      </p>
                      <ul className="list-disc ps-5 text-sm text-muted-foreground space-y-1">
                        {aiSummary.potentialInconsistencies.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {aiActiveRef.current ? t("ai.generating") : t("ai.hint")}
              </p>
            )}
          </motion.div>

          {/* Validation Form */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.5, ease, delay: 0.2 }}
            className="lg:col-span-2 border border-primary/30 bg-primary/5 p-6 space-y-6"
          >
            <h2 className="font-serif text-lg text-heading flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t("setInternshipPeriod")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("startDate")} *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("endDate")} *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleValidate}
                disabled={actionLoading || !startDate || !endDate}
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
              >
                {(actionLoading || pdfLoading) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {pdfLoading ? t("generatingPdf") : t("validateAndGenerate")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setRejectModal(true)}
                disabled={actionLoading}
                className="flex-1 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
                {t("reject")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background border border-border p-6 max-w-md w-full space-y-4"
          >
            <h3 className="font-serif text-lg text-heading">{t("rejectTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("rejectDescription", { name: application?.student.name || "Student" })}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("rejectReasonPlaceholder")}
              className="w-full min-h-[80px] px-3 py-2 text-sm border border-border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectModal(false)
                  setRejectReason("")
                }}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("confirmReject")
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string | null | undefined
  icon?: React.ReactNode
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <div className="flex-1 min-w-0">
        <span className="text-muted-foreground text-xs">{label}:</span>{" "}
        <span className="text-foreground break-words">{value}</span>
      </div>
    </div>
  )
}
