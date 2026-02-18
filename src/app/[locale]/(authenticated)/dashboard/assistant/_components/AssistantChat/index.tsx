"use client";

import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";

import { ConversationSidebar } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/ConversationSidebar";
import { ConversationThread } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/ConversationThread";
import { AssistantHeader } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/AssistantHeader";
import { ChatHeader } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/ChatHeader";
import { useChatSession } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/hooks/useChatSession";

export function AssistantChat() {
  const t = useTranslations("dashboard.assistant");

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
    handleUpdateTitle,
    handleAppendNote,
  } = useChatSession();

  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100vh - 12rem)", minHeight: "500px" }}
    >
      <AssistantHeader />

      <div className="flex-1 flex flex-row gap-6 min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-[320px] shrink-0">
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
        <Card className="rounded-none border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden">
          <ChatHeader
            conversationTitle={selectedConversation?.title}
            models={models}
            activeModel={activeModel}
            onUpdateModel={handleUpdateModel}
            onUpdateTitle={handleUpdateTitle}
            onAppendNote={handleAppendNote}
            onCreateConversation={handleCreateConversation}
          />

          <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-5">
            {!activeConversationId || messagesLoading ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
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
  );
}
