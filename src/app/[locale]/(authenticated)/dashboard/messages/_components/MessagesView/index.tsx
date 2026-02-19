"use client"

import * as motion from "motion/react-client"
import { useEffect, useMemo } from "react"
import { ConversationPane } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/components/ConversationPane"
import { MessagesHeader } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/components/MessagesHeader"
import { ThreadListPane } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/components/ThreadListPane"
import { useMessagesData } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/hooks/useMessagesData"
import { useMessagesState } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/hooks/useMessagesState"
import type { MessagesRole } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"
import { revealWithDelay } from "@/lib/animations"

interface MessagesViewProps {
  role: MessagesRole
  currentUserId: string
}

export function MessagesView({ role, currentUserId }: MessagesViewProps) {
  const { selectedThreadId, selectThread, draft, setDraft, resetDraft } =
    useMessagesState()

  const {
    threads,
    threadsLoading,
    threadsErrorMessage,
    threadMessages,
    threadMessagesLoading,
    threadMessagesErrorMessage,
    sendMessage,
    sendPending,
    sendErrorMessage,
  } = useMessagesData({
    role,
    selectedThreadId,
  })

  useEffect(() => {
    if (threads.length === 0) {
      if (selectedThreadId !== null) {
        selectThread(null)
      }
      return
    }

    if (
      !selectedThreadId ||
      !threads.some((thread) => thread.id === selectedThreadId)
    ) {
      selectThread(threads[0]?.id ?? null)
    }
  }, [selectedThreadId, selectThread, threads])

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [threads, selectedThreadId],
  )

  const handleSendMessage = async () => {
    if (!selectedThread) {
      return
    }

    const body = draft.trim()
    if (!body) {
      return
    }

    try {
      await sendMessage({ thread: selectedThread, body })
      resetDraft()
    } catch {}
  }

  return (
    <div className="space-y-6">
      <MessagesHeader role={role} threadCount={threads.length} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={revealWithDelay(0.08)}
        className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]"
      >
        <ThreadListPane
          role={role}
          threads={threads}
          selectedThreadId={selectedThreadId}
          isLoading={threadsLoading}
          errorMessage={threadsErrorMessage}
          onSelectThread={selectThread}
        />

        <ConversationPane
          role={role}
          currentUserId={currentUserId}
          selectedThread={selectedThread}
          messages={threadMessages}
          isLoading={threadMessagesLoading}
          errorMessage={threadMessagesErrorMessage}
          draft={draft}
          onDraftChange={setDraft}
          onSendMessage={handleSendMessage}
          sendPending={sendPending}
          sendErrorMessage={sendErrorMessage}
        />
      </motion.div>
    </div>
  )
}
