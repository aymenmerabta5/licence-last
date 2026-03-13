import { afterAll, describe, expect, mock, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"
import type { RefObject } from "react"
import { createMotionReactClientMock } from "@/test/mocks/motion-react-client"

mock.module("next-intl", () => ({
  useTranslations: () => (key: string) => {
    if (key === "empty") {
      return "No notifications yet."
    }
    return key
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
