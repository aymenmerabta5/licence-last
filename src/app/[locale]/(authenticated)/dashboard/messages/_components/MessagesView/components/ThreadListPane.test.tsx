import { afterAll, afterEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"
import type { MessageThread } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"
import { createMotionReactClientMock } from "@/test/mocks/motion-react-client"

mock.module("next-intl", () => ({
  useTranslations: () => (key: string, values?: { count?: number }) => {
    if (key === "unreadAria") {
      return `${values?.count ?? 0} unread messages`
    }
    if (key === "threadUnread") {
      return "Unread messages"
    }
    if (key === "threadOpen") {
      return "Open thread"
    }
    if (key === "threadsLabel") {
      return "Threads"
    }
    if (key === "fallbackCompanyName") {
      return "Company"
    }
    if (key === "fallbackStudentName") {
      return "Student"
    }
    return key
  },
}))

mock.module("motion/react-client", createMotionReactClientMock)

const { ThreadListPane } = await import(
  "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/components/ThreadListPane"
)

describe("ThreadListPane", () => {
  afterAll(() => {
    mock.restore()
  })

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
        starters={[]}
        selectedThreadId={null}
        selectedStarterId={null}
        isLoading={false}
        errorMessage={null}
        starterErrorMessage={null}
        searchQuery=""
        onSearchChange={() => {}}
        onSelectThread={() => {}}
        onSelectStarter={() => {}}
      />,
    )

    expect(screen.getByLabelText("3 unread messages")).toBeTruthy()
    expect(screen.getByText("Unread messages")).toBeTruthy()
    expect(screen.queryByLabelText("0 unread messages")).toBeNull()
  })

  test("filters threads by offer title", () => {
    const threads: MessageThread[] = [
      {
        id: "thread-1",
        offerId: "offer-1",
        offerTitle: "Backend Intern",
        companyId: "company-1",
        companyName: "Stag",
        companyLogoUrl: null,
        lastMessageAt: new Date("2030-01-02T00:00:00.000Z"),
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
        hasUnread: false,
        unreadCount: 0,
      },
      {
        id: "thread-2",
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
        starters={[]}
        selectedThreadId={null}
        selectedStarterId={null}
        isLoading={false}
        errorMessage={null}
        starterErrorMessage={null}
        searchQuery="backend"
        onSearchChange={() => {}}
        onSelectThread={() => {}}
        onSelectStarter={() => {}}
      />,
    )

    expect(screen.getByText("Backend Intern")).toBeTruthy()
    expect(screen.queryByText("Frontend Intern")).toBeNull()
  })

  test("shows no results when search matches nothing", () => {
    const threads: MessageThread[] = [
      {
        id: "thread-1",
        offerId: "offer-1",
        offerTitle: "Backend Intern",
        companyId: "company-1",
        companyName: "Stag",
        companyLogoUrl: null,
        lastMessageAt: new Date("2030-01-02T00:00:00.000Z"),
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
        hasUnread: false,
        unreadCount: 0,
      },
    ]

    render(
      <ThreadListPane
        role="student"
        threads={threads}
        starters={[]}
        selectedThreadId={null}
        selectedStarterId={null}
        isLoading={false}
        errorMessage={null}
        starterErrorMessage={null}
        searchQuery="xyz"
        onSearchChange={() => {}}
        onSelectThread={() => {}}
        onSelectStarter={() => {}}
      />,
    )

    expect(screen.getByText("noSearchResults")).toBeTruthy()
  })
})
