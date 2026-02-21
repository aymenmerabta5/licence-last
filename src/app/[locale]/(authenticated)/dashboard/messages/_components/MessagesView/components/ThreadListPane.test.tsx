import { afterEach, describe, expect, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

import { ThreadListPane } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/components/ThreadListPane"
import type { MessageThread } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"

describe("ThreadListPane", () => {
  afterEach(() => {
    cleanup()
  })

  test("shows unread badge metadata for unread threads", () => {
    const threads: MessageThread[] = [
      {
        id: "thread-unread",
        offerId: "offer-1",
        offerTitle: "Backend Intern",
        companyId: "company-1",
        companyName: "Stag",
        companyLogoUrl: null,
        lastMessageAt: new Date("2030-01-02T00:00:00.000Z"),
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
        hasUnread: true,
        unreadCount: 3,
      },
      {
        id: "thread-read",
        offerId: "offer-2",
        offerTitle: "Frontend Intern",
        companyId: "company-2",
        companyName: "Aster Labs",
        companyLogoUrl: null,
        lastMessageAt: new Date("2030-01-03T00:00:00.000Z"),
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
        hasUnread: false,
        unreadCount: 0,
      },
    ]

    render(
      <ThreadListPane
        role="student"
        threads={threads}
        selectedThreadId={null}
        isLoading={false}
        errorMessage={null}
        onSelectThread={() => {}}
      />,
    )

    expect(screen.getByLabelText("3 unread messages")).toBeTruthy()
    expect(screen.getByText("Unread messages")).toBeTruthy()
    expect(screen.queryByLabelText("0 unread messages")).toBeNull()
  })
})
