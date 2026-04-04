import { afterAll, afterEach, describe, expect, mock, test } from "bun:test"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import type { RefObject } from "react"
import { createMotionReactClientMock } from "@/test/mocks/motion-react-client"

mock.module("lucide-react", () => ({
  Loader2: () => <span>Loader2</span>,
}))

mock.module("next-intl", () => ({
  useTranslations: () =>
    (key: string, values?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        empty: "No notifications yet.",
        "feed.titles.new_application": "New application",
        "feed.messages.new_application.withOfferTitle":
          "A student applied for {offerTitle}.",
        "feed.titles.application_stage_changed": "Application stage updated",
        "feed.stageLabels.interview": "Interview",
        "feed.messages.application_stage_changed.withOfferAndStage":
          "{offerTitle} moved to {stage}.",
        "feed.titles.company_approved": "Company approved",
        "feed.messages.company_approved.withCompanyName":
          "{companyName} has been approved.",
      }

      let text = translations[key] ?? key
      for (const [name, value] of Object.entries(values ?? {})) {
        text = text.replace(`{${name}}`, String(value))
      }
      return text
    },
}))

mock.module("motion/react-client", createMotionReactClientMock)

const { NotificationsList } = await import(
  "@/app/[locale]/(authenticated)/dashboard/notifications/_components/NotificationsView/components/NotificationsList"
)

describe("src/app/[locale]/(authenticated)/dashboard/notifications/_components/NotificationsView/components/NotificationsList", () => {
  afterAll(() => {
    mock.restore()
  })

  afterEach(() => {
    cleanup()
  })

  const sentinelRef = { current: null } as RefObject<HTMLDivElement | null>

  test("renders a formatted notification message instead of raw payload JSON", () => {
    const onMarkRead = mock(() => {})

    render(
      <NotificationsList
        notifications={[
          {
            id: "n-1",
            type: "new_application",
            createdAt: "2026-02-18T10:00:00.000Z",
            readAt: null,
            payload: { offerTitle: "Platform Engineer Intern" },
          },
        ]}
        isLoading={false}
        isFetchingNextPage={false}
        onMarkRead={onMarkRead}
        sentinelRef={sentinelRef}
      />,
    )

    expect(screen.getByText("New application")).toBeDefined()
    expect(
      screen.getByText("A student applied for Platform Engineer Intern."),
    ).toBeDefined()
    expect(
      screen.queryByText(/\{"offerTitle":"Platform Engineer Intern"\}/),
    ).toBeNull()
  })

  test("calls onMarkRead only for unread notifications", () => {
    const onMarkRead = mock(() => {})

    render(
      <NotificationsList
        notifications={[
          {
            id: "n-unread",
            type: "application_stage_changed",
            createdAt: "2026-02-18T10:00:00.000Z",
            readAt: null,
            payload: { offerTitle: "Backend Internship", stage: "interview" },
          },
          {
            id: "n-read",
            type: "company_approved",
            createdAt: "2026-02-18T09:00:00.000Z",
            readAt: "2026-02-18T09:30:00.000Z",
            payload: { companyName: "Nova Labs" },
          },
        ]}
        isLoading={false}
        isFetchingNextPage={false}
        onMarkRead={onMarkRead}
        sentinelRef={sentinelRef}
      />,
    )

    const buttons = screen.getAllByRole("button")
    fireEvent.click(buttons[0])
    fireEvent.click(buttons[1])

    expect(onMarkRead).toHaveBeenCalledTimes(1)
    expect(onMarkRead).toHaveBeenCalledWith("n-unread")
  })
})
