"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { DefaultChatTransport } from "ai"
import { useChat } from "@ai-sdk/react"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCheck, Loader2, Sparkles } from "lucide-react"

import { asRecord, findLatestToolOutput, getStringArray } from "@/lib/ai/tool-output"
import { orpcClient } from "@/server/orpc/client"
import { Button } from "@/components/ui/button"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

interface NotificationsClientProps {
  role: string
}

type NotificationsSummary = {
  summaryBullets: string[]
  suggestedNextActions: string[]
}

export function NotificationsClient({ role }: NotificationsClientProps) {
  const t = useTranslations("dashboard.notifications")
  const queryClient = useQueryClient()

  const [aiSummary, setAiSummary] = useState<NotificationsSummary | null>(null)
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
      aiActiveRef.current = false

      const out = asRecord(findLatestToolOutput(messages, "notifications_summarize"))
      if (!out) return

      setAiSummary({
        summaryBullets: getStringArray(out.summaryBullets),
        suggestedNextActions: getStringArray(out.suggestedNextActions),
      })
    },
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["notifications", "list"],
    queryFn: async ({ pageParam }) =>
      orpcClient.notifications.list({
        cursor: pageParam as { createdAt: string; id: string } | undefined,
        limit: 20,
      }),
    initialPageParam: undefined as { createdAt: string; id: string } | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const notifications = data?.pages.flatMap((p) => p.notifications) ?? []
  const unreadCount = data?.pages[0]?.unreadCount ?? 0

  const markAllReadMutation = useMutation({
    mutationFn: async () => orpcClient.notifications.markAllRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
    },
  })

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
    <div className="space-y-6">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }} className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-heading tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground font-light">
            {t("unreadCount", { count: unreadCount })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={aiStatus !== "ready" || notifications.length === 0}
            onClick={() => {
              aiActiveRef.current = true
              setAiSummary(null)
              setAiMessages([])

              const context = {
                intent: "notifications_summarize",
                role,
                notifications: notifications.slice(0, 50).map((n) => ({
                  id: n.id,
                  type: n.type,
                  createdAt: n.createdAt,
                  readAt: n.readAt,
                  payload: n.payload,
                })),
              }

              void sendAiMessage(
                { text: t("prompts.summarize") },
                { body: { context } },
              )
            }}
          >
            <Sparkles className="h-4 w-4" />
            {t("summarize")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
          >
            <CheckCheck className="h-4 w-4" />
            {t("markAllRead")}
          </Button>
        </div>
      </motion.div>

      {aiError && <p className="text-xs text-destructive">{aiError.message}</p>}

      {aiSummary && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.5, ease, delay: 0.06 }}
          className="border border-border bg-primary/5 p-4 rounded-none space-y-3"
        >
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/70">
            {t("aiSummary.title")}
          </p>
          <ul className="list-disc ps-5 text-sm text-muted-foreground space-y-1">
            {aiSummary.summaryBullets.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          {aiSummary.suggestedNextActions.length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                {t("aiSummary.suggestedNextActions")}
              </p>
              <ul className="list-disc ps-5 text-sm text-muted-foreground space-y-1">
                {aiSummary.suggestedNextActions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              {...reveal}
              transition={{ duration: 0.4, ease, delay: 0.02 * i }}
              className="border border-border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-heading">
                    {n.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 break-words">
                    {JSON.stringify(n.payload)}
                  </p>
                </div>
                {n.readAt === null && (
                  <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
