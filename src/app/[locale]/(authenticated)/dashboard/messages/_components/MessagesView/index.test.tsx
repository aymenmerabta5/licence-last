import { afterEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render } from "@testing-library/react"
import type * as React from "react"

const selectThreadMock = mock((_threadId: string | null) => {})
const selectStarterMock = mock((_starterId: string | null) => {})

mock.module("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("threadId=thread-2"),
}))

mock.module(
  "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/hooks/useMessagesState",
  () => ({
    useMessagesState: () => ({
      selectedThreadId: null,
      selectThread: selectThreadMock,
      selectedStarterId: null,
      selectStarter: selectStarterMock,
      draft: "",
      setDraft: () => {},
      resetDraft: () => {},
    }),
  }),
)

mock.module(
  "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/hooks/useMessagesData",
  () => ({
    useMessagesData: () => ({
      threads: [
        {
          id: "thread-2",
          offerId: "offer-1",
          offerTitle: "Backend Internship",
          companyName: "Stag",
          companyLogoUrl: null,
          lastMessageAt: new Date("2030-01-02T00:00:00.000Z"),
          createdAt: new Date("2030-01-01T00:00:00.000Z"),
          hasUnread: true,
          unreadCount: 1,
        },
      ],
      starters: [],
      threadsLoading: false,
      threadsErrorMessage: null,
      startersErrorMessage: null,
      threadMessages: [],
      threadMessagesLoading: false,
      threadMessagesErrorMessage: null,
      sendMessage: () => {},
      sendPending: false,
      sendErrorMessage: null,
    }),
  }),
)

mock.module(
  "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/components/MessagesHeader",
  () => ({
    MessagesHeader: ({ threadCount }: { threadCount: number }) => (
      <div>Threads: {threadCount}</div>
    ),
  }),
)

mock.module(
  "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/components/ThreadListPane",
  () => ({
    ThreadListPane: (_props: React.ComponentProps<"div">) => <div>Thread list</div>,
  }),
)

mock.module(
  "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/components/ConversationPane",
  () => ({
    ConversationPane: (_props: React.ComponentProps<"div">) => (
      <div>Conversation pane</div>
    ),
  }),
)

const { MessagesView } = await import(
  "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView"
)

describe("MessagesView", () => {
  afterEach(() => {
    cleanup()
    selectThreadMock.mockClear()
    selectStarterMock.mockClear()
  })

  test("selects the thread from the URL when threadId is present", () => {
    render(<MessagesView role="student" currentUserId="student-1" />)

    expect(selectThreadMock).toHaveBeenCalledWith("thread-2")
  })
})