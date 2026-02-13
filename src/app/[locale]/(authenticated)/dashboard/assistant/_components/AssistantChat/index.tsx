"use client"

import { useTranslations } from "next-intl"

import { Card } from "@/components/ui/card"

import { ConversationSidebar } from "./components/ConversationSidebar"
import { ConversationThread } from "./components/ConversationThread"
import { AssistantHeader } from "./components/AssistantHeader"
import { ChatHeader } from "./components/ChatHeader"
import { useChatSession } from "./hooks/useChatSession"

export function AssistantChat() {
  const t = useTranslations("dashboard.assistant")

  const {
    conversations,
    conversationsLoading,
    activeConversationId,
    selectedConversation,
    models,
    activeModel,
    messagesLoading,
    initialMessages,
    messageCreatedAtById,
    handleSelectConversation,
    handleCreateConversation,
    handleDeleteConversation,
    handleUpdateModel,
  } = useChatSession()

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[600px]">
      <AssistantHeader />

      <div className="flex-1 grid gap-6 lg:grid-cols-[320px,1fr] min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <div className="h-full">
            <ConversationSidebar
              conversations={conversations}
              selectedConversationId={activeConversationId}
              isLoading={conversationsLoading}
              onSelect={handleSelectConversation}
              onCreate={handleCreateConversation}
              onDelete={handleDeleteConversation}
            />
          </div>
        </div>

        {/* Chat area */}
        <Card className="rounded-none border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 flex flex-col h-full overflow-hidden">
          <ChatHeader
            conversationTitle={selectedConversation?.title}
            models={models}
            activeModel={activeModel}
            onUpdateModel={handleUpdateModel}
            onCreateConversation={handleCreateConversation}
          />

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
                messageCreatedAtById={messageCreatedAtById}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
