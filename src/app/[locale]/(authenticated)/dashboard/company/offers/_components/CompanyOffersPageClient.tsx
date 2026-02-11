"use client"

import { useState } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus,
  Pencil,
  Rocket,
  XCircle,
  Trash2,
  Briefcase,
  MapPin,
  Clock,
  Users,
  Loader2,
  UserCheck,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import { orpc } from "@/server/orpc/client"
import { Button } from "@/components/ui/button"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  published: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  closed: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700",
}

export function CompanyOffersPageClient() {
  const t = useTranslations("dashboard.company.offers")
  const queryClient = useQueryClient()

  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { data: offers = [], isLoading } = useQuery(
    orpc.offers.listByCompany.queryOptions(),
  )
  const companyId = offers[0]?.companyId
  const trustQuery = useQuery({
    ...orpc.companies.getTrustIndex.queryOptions({
      input: { companyId: companyId ?? "" },
    }),
    enabled: !!companyId,
  })

  const statusMutation = useMutation(
    orpc.offers.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.offers.listByCompany.queryOptions().queryKey })
      },
    }),
  )

  const deleteMutation = useMutation(
    orpc.offers.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.offers.listByCompany.queryOptions().queryKey })
      },
    }),
  )

  const handlePublish = async (offerId: string) => {
    setActionLoading(offerId)
    try {
      await statusMutation.mutateAsync({ offerId, action: "publish" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleClose = async (offerId: string) => {
    if (!window.confirm(t("actions.confirmClose"))) return
    setActionLoading(offerId)
    try {
      await statusMutation.mutateAsync({ offerId, action: "close" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (offerId: string) => {
    if (!window.confirm(t("actions.confirmDelete"))) return
    setActionLoading(offerId)
    try {
      await deleteMutation.mutateAsync({ offerId })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ── Header ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="flex items-start justify-between"
      >
        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-heading tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            {t("subtitle")}
          </p>
        </div>
        <Link href={"/dashboard/company/offers/new" as "/dashboard"}>
          <Button variant="editorial" size="editorial" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("createOffer")}
          </Button>
        </Link>
      </motion.div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && trustQuery.data && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.45, ease, delay: 0.05 }}
          className="border border-border p-4 flex flex-wrap items-center gap-4"
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Company Trust Index
          </p>
          <p className="font-serif text-2xl text-heading">
            {trustQuery.data.trustScore}
            <span className="text-sm text-muted-foreground">/100</span>
          </p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Tier: {trustQuery.data.tier}
          </p>
          <p className="text-xs text-muted-foreground">
            Response {trustQuery.data.factors.responseRate}% · Completion {trustQuery.data.factors.completionRate}%
          </p>
        </motion.div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && offers.length === 0 && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="border border-dashed border-border p-12 text-center"
        >
          <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </motion.div>
      )}

      {/* ── Offers List ── */}
      {!isLoading && offers.length > 0 && (
        <div className="space-y-4">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.id}
              {...reveal}
              transition={{ duration: 0.5, ease, delay: 0.05 * i }}
              className="border border-border p-5 space-y-3"
            >
              {/* ── Title row ── */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <h3 className="font-serif text-lg text-heading tracking-tight truncate">
                    {offer.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border ${STATUS_COLORS[offer.status]}`}>
                      {t(`status.${offer.status}` as "status.draft")}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 border border-border">
                      {t(`type.${offer.internshipType}` as "type.pfe")}
                    </span>
                    {offer.workMode && (
                      <span className="inline-flex items-center px-2 py-0.5 border border-border">
                        {t(`workMode.${offer.workMode}` as "workMode.on_site")}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Actions ── */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {actionLoading === offer.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      {(offer.status === "draft" || offer.status === "published") && (
                        <Link href={`/dashboard/company/offers/${offer.id}/edit` as "/dashboard"}>
                          <button
                            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                            title={t("actions.edit")}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </Link>
                      )}
                      {offer.status === "draft" && (
                        <>
                          <button
                            onClick={() => handlePublish(offer.id)}
                            className="p-1.5 text-muted-foreground hover:text-green-600 transition-colors"
                            title={t("actions.publish")}
                          >
                            <Rocket className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(offer.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                            title={t("actions.delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {offer.status === "published" && (
                        <button
                          onClick={() => handleClose(offer.id)}
                          className="p-1.5 text-muted-foreground hover:text-amber-600 transition-colors"
                          title={t("actions.close")}
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* ── Meta info ── */}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {offer.wilayaCode && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {String(offer.wilayaCode).padStart(2, "0")}
                  </span>
                )}
                {offer.durationWeeks && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {offer.durationWeeks} {t("weeks")}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {offer.maxPositions} {t("positions")}
                </span>
              </div>

              {/* ── Skills ── */}
              {offer.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {offer.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center px-2 py-0.5 text-[10px] bg-primary/10 border border-primary/20 text-primary"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              )}

              {/* ── Candidates ── */}
              {offer.status !== "draft" && (
                <Link
                  href={`/dashboard/company/offers/${offer.id}/candidates` as "/dashboard"}
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>
                    {offer.candidatesCount} {t("candidates", { count: offer.candidatesCount })}
                  </span>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
