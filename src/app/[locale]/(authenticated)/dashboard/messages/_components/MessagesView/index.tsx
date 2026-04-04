"use client"

import * as motion from "motion/react-client"
import { useEffect, useMemo, useState } from "react"
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
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null)
  const {
    selectedThreadId,
    selectThread,
    selectedStarterId,
    selectStarter,
    draft,
    setDraft,
    resetDraft,
  } = useMessagesState()

  const {
    threads,
    starters,
    threadsLoading,
    threadsErrorMessage,
    startersErrorMessage,
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
    if (pendingThreadId && threads.some((thread) => thread.id === pendingThreadId)) {
      setPendingThreadId(null)
    }
  }, [pendingThreadId, threads])

  useEffect(() => {
    const hasSelectedThread = selectedThreadId
      ? threads.some((thread) => thread.id === selectedThreadId)
      : false
    const hasSelectedStarter = selectedStarterId
      ? starters.some((starter) => starter.id === selectedStarterId)
      : false

    if (
      selectedThreadId &&
      !hasSelectedThread &&
      pendingThreadId !== selectedThreadId
    ) {
      selectThread(null)
    }

    if (selectedStarterId && !hasSelectedStarter) {
      selectStarter(null)
    }

    if (hasSelectedThread || hasSelectedStarter) {
      return
    }

    if (pendingThreadId) {
      return
    }

    if (threads.length > 0) {
      selectThread(threads[0]?.id ?? null)
      return
    }

    if (starters.length > 0) {
      selectStarter(starters[0]?.id ?? null)
    }
  }, [
    selectedStarterId,
    selectedThreadId,
    pendingThreadId,
    selectStarter,
    selectThread,
    starters,
    threads,
  ])

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [threads, selectedThreadId],
  )
  const selectedStarter = useMemo(
    () => starters.find((starter) => starter.id === selectedStarterId) ?? null,
    [selectedStarterId, starters],
  )

  const handleSendMessage = async () => {
    const target = selectedThread
      ? { kind: "thread" as const, thread: selectedThread }
      : selectedStarter
        ? { kind: "starter" as const, starter: selectedStarter }
        : null

    if (!target) {
      return
    }

    const body = draft.trim()
    if (!body) {
      return
    }

    try {
      const result = await sendMessage({ target, body })
      resetDraft()
      if (target.kind === "starter") {
        setPendingThreadId(result.threadId)
        selectThread(result.threadId)
      }
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
          starters={starters}
          selectedThreadId={selectedThreadId}
          selectedStarterId={selectedStarterId}
          isLoading={threadsLoading}
          errorMessage={threadsErrorMessage}
          starterErrorMessage={startersErrorMessage}
          onSelectThread={selectThread}
          onSelectStarter={selectStarter}
        />

        <ConversationPane
          role={role}
          currentUserId={currentUserId}
          selectedThread={selectedThread}
          selectedStarter={selectedStarter}
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
