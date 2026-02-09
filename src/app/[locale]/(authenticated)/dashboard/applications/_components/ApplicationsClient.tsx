"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  FileText,
  Building2,
  MapPin,
  Loader2,
  Search,
  X,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import { orpcClient, orpc } from "@/server/orpc/client"
import { Button } from "@/components/ui/button"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

const STATUS_TABS = [
  "all",
  "applied",
  "company_accepted",
  "company_refused",
  "admin_validated",
  "admin_rejected",
  "withdrawn",
] as const

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

type StatusFilter = (typeof STATUS_TABS)[number]

export function ApplicationsClient() {
  const t = useTranslations("dashboard.applications")
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<StatusFilter>("all")
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)

  const statusParam =
    activeTab === "all"
      ? undefined
      : (activeTab as
          | "applied"
          | "company_accepted"
          | "company_refused"
          | "admin_validated"
          | "admin_rejected"
          | "withdrawn")

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["applications", "listByStudent", activeTab],
    queryFn: async ({ pageParam }) => {
      return orpcClient.applications.listByStudent({
        status: statusParam,
        cursor: pageParam ?? undefined,
        limit: 12,
      })
    },
    initialPageParam: undefined as
      | { createdAt: string; id: string }
      | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const applications = data?.pages.flatMap((p) => p.applications) ?? []

  const withdrawMutation = useMutation(
    orpc.applications.withdraw.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["applications", "listByStudent"],
        })
        setWithdrawingId(null)
      },
      onError: () => {
        setWithdrawingId(null)
      },
    }),
  )

  const handleWithdraw = (applicationId: string) => {
    if (!window.confirm(t("withdrawConfirm"))) return
    setWithdrawingId(applicationId)
    withdrawMutation.mutate({ applicationId })
  }

  // Intersection observer
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground font-light mt-1">
          {t("subtitle")}
        </p>
      </motion.div>

      {/* Status tabs */}
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
            {t(`statusFilter.${tab}` as "statusFilter.all")}
          </button>
        ))}
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && applications.length === 0 && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="border border-dashed border-border p-12 text-center space-y-4"
        >
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {activeTab === "all" ? t("empty") : t("emptyFiltered")}
          </p>
          {activeTab === "all" && (
            <Link href={"/dashboard/explore" as "/dashboard"}>
              <Button variant="editorial" size="editorial" className="gap-2">
                <Search className="h-4 w-4" />
                {t("exploreOffers")}
              </Button>
            </Link>
          )}
        </motion.div>
      )}

      {/* Applications list */}
      {applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((app, i) => (
            <motion.div
              key={app.id}
              {...reveal}
              transition={{ duration: 0.4, ease, delay: 0.03 * i }}
              className="border border-border p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <Link
                    href={`/dashboard/explore/${app.offerId}` as "/dashboard"}
                    className="hover:text-primary transition-colors"
                  >
                    <h3 className="font-serif text-lg text-heading tracking-tight truncate">
                      {app.offerTitle}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {app.companyName}
                    </span>
                    {app.offerWilayaCode && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {String(app.offerWilayaCode).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase border ${STATUS_COLORS[app.status] ?? ""}`}
                  >
                    {t(`status.${app.status}` as "status.applied")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {t("appliedOn")}{" "}
                  {new Date(app.createdAt).toLocaleDateString()}
                </p>

                {app.status === "applied" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleWithdraw(app.id)}
                    disabled={withdrawingId === app.id}
                    className="text-xs text-muted-foreground hover:text-destructive gap-1"
                  >
                    {withdrawingId === app.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    {t("withdraw")}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-4" />

      {/* Loading more */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
