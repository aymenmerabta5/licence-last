"use client"

import { useEffect, useMemo, useState } from "react"
import type { UIMessage } from "ai"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as motion from "motion/react-client"
import { Plus, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"

import { orpc } from "@/server/orpc/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { ConversationSidebar } from "./components/ConversationSidebar"
import { ConversationThread } from "./components/ConversationThread"
import { formatConversationTitle } from "./utils"

const reveal = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

const ease = [0.4, 0, 0.2, 1] as const

function isMessageRole(value: unknown): value is "system" | "user" | "assistant" {
  return value === "system" || value === "user" || value === "assistant"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

type UIMessagePart = UIMessage["parts"][number]

function isUIMessagePart(value: unknown): value is UIMessagePart {
  return isRecord(value) && typeof value.type === "string"
}

function coerceParts(value: unknown): UIMessage["parts"] {
  if (!Array.isArray(value)) return []
  return value.filter(isUIMessagePart)
}

function toChatMessages(rows: Array<{ id: string; role: unknown; parts: unknown }>): UIMessage[] {
  return rows
    .filter(
      (r): r is { id: string; role: "system" | "user" | "assistant"; parts: unknown } =>
        isMessageRole(r.role),
    )
    .map((r) => ({
      id: r.id,
      role: r.role,
      parts: coerceParts(r.parts),
    }))
}

export function AssistantChat() {
  const t = useTranslations("dashboard.assistant")
  const queryClient = useQueryClient()

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  const listModelsQuery = useMemo(() => orpc.assistant.listModels.queryOptions(), [])
  const { data: modelsData, isLoading: modelsLoading } = useQuery(listModelsQuery)

  const models = useMemo(() => modelsData?.models ?? [], [modelsData])
  const defaultModelId = modelsData?.defaultModelId ?? null

  const listConversationsQuery = useMemo(
    () => orpc.assistant.listConversations.queryOptions({ input: { limit: 100 } }),
    [],
  )
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
  } = useQuery(listConversationsQuery)

  const conversations = useMemo(
    () => conversationsData?.conversations ?? [],
    [conversationsData],
  )

  const activeConversationId = selectedConversationId ?? conversations[0]?.id ?? null
  const selectedConversation =
    (activeConversationId
      ? conversations.find((c) => c.id === activeConversationId)
      : null) ?? null

  const createConversationMutation = useMutation(
    orpc.assistant.createConversation.mutationOptions({
      onSuccess: async (conv) => {
        setSelectedConversationId(conv.id)
        await queryClient.invalidateQueries({ queryKey: listConversationsQuery.queryKey })
      },
    }),
  )

  const updateModelMutation = useMutation(
    orpc.assistant.updateConversationModel.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: listConversationsQuery.queryKey })
      },
    }),
  )

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    ...orpc.assistant.listMessages.queryOptions({
      input: { conversationId: activeConversationId ?? "__disabled__" },
    }),
    enabled: Boolean(activeConversationId),
  })

  const persistedMessages = useMemo(() => messagesData?.messages ?? [], [messagesData])
  const initialMessages = useMemo(() => toChatMessages(persistedMessages), [persistedMessages])

  useEffect(() => {
    if (conversationsLoading || modelsLoading) return
    if (activeConversationId) return

    if (createConversationMutation.isPending) return
    const modelId = defaultModelId ?? (models[0]?.id ?? null)
    if (!modelId) return

    createConversationMutation.mutate({ model: modelId })
  }, [
    conversationsLoading,
    modelsLoading,
    activeConversationId,
    createConversationMutation,
    defaultModelId,
    models,
  ])

  const activeModel = selectedConversation?.model ?? defaultModelId

  return (
    <div className="space-y-8">
      <motion.header
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="space-y-3"
      >
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
          {t("kicker")}
        </p>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-none tracking-tight text-heading">
              {t.rich("title", {
                accent: (chunks) => <span className="text-primary">{chunks}</span>,
              })}
            </h1>
            <p className="text-sm text-muted-foreground font-light tracking-wide max-w-2xl">
              {t("subtitle")}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs tracking-wide">{t("badge")}</span>
          </div>
        </div>
      </motion.header>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <ConversationSidebar
          conversations={conversations}
          selectedConversationId={activeConversationId}
          isLoading={conversationsLoading}
          onSelect={(id) => setSelectedConversationId(id)}
          onCreate={() => {
            const modelId = defaultModelId ?? (models[0]?.id ?? null)
            if (!modelId) return
            createConversationMutation.mutate({ model: modelId })
          }}
        />

        <Card className="rounded-none border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
          <div className="border-b border-border/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                {t("conversation")}
              </p>
              <p className="mt-1 text-sm text-foreground truncate">
                {formatConversationTitle(selectedConversation?.title)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {t("model")}
                </p>
                <Select
                  value={activeModel ?? null}
                  onValueChange={(value) => {
                    const conversationId = activeConversationId
                    if (!conversationId) return
                    if (!value) return
                    updateModelMutation.mutate({
                      conversationId,
                      model: value,
                    })
                  }}
                >
                  <SelectTrigger size="sm" className="rounded-none">
                    <SelectValue placeholder={t("selectModel")} />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {models.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="editorial-ghost"
                size="editorial-sm"
                className="gap-2"
                onClick={() => {
                  const modelId = defaultModelId ?? (models[0]?.id ?? null)
                  if (!modelId) return
                  createConversationMutation.mutate({ model: modelId })
                }}
              >
                <Plus className="h-4 w-4" />
                {t("newConversation")}
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {!activeConversationId || messagesLoading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {t("loadingMessages")}
              </div>
            ) : (
              <ConversationThread
                key={activeConversationId}
                conversationId={activeConversationId}
                initialMessages={initialMessages}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
