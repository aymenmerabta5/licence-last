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
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery(listConversationsQuery)

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

  const deleteConversationMutation = useMutation(
    orpc.assistant.deleteConversation.mutationOptions({
      onSuccess: async () => {
        // If we deleted the active conversation, select another one
        if (selectedConversationId === activeConversationId) {
          const remaining = conversations.filter((c) => c.id !== activeConversationId)
          setSelectedConversationId(remaining[0]?.id ?? null)
        }
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

  const handleDeleteConversation = async (conversationId: string) => {
    await deleteConversationMutation.mutateAsync({ conversationId })
  }

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[600px]">
      {/* Header */}
      <motion.header
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="space-y-3 mb-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
              {t("kicker")}
            </p>
            <h1 className="font-serif text-[clamp(1.75rem,4vw,2.5rem)] leading-none tracking-tight text-heading">
              {t.rich("title", {
                accent: (chunks) => <span className="text-primary">{chunks}</span>,
              })}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs tracking-wide">{t("badge")}</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 grid gap-6 lg:grid-cols-[320px,1fr] min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <div className="h-full">
            <ConversationSidebar
              conversations={conversations}
              selectedConversationId={activeConversationId}
              isLoading={conversationsLoading}
              onSelect={handleSelectConversation}
              onCreate={() => {
                const modelId = defaultModelId ?? (models[0]?.id ?? null)
                if (!modelId) return
                createConversationMutation.mutate({ model: modelId })
              }}
              onDelete={handleDeleteConversation}
            />
          </div>
        </div>

        {/* Chat area */}
        <Card className="rounded-none border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 flex flex-col h-full overflow-hidden">
          {/* Chat header */}
          <div className="border-b border-border/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
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
                  value={activeModel ?? undefined}
                  onValueChange={(value) => {
                    if (!activeConversationId || !value) return
                    updateModelMutation.mutate({
                      conversationId: activeConversationId,
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

          {/* Messages thread */}
          <div className="flex-1 overflow-hidden p-4 sm:p-5">
            {!activeConversationId || messagesLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
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
