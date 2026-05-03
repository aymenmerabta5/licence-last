import { beforeEach, describe, expect, mock, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"
import type * as React from "react"

mock.module("next-intl", () => ({
  useTranslations:
    () => (key: string, values?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        title: "Notifications",
        markAllRead: "Mark all read",
        empty: "No notifications yet.",
        viewAll: "View all",
        "feed.titles.new_message": "New message",
        "feed.messages.new_message.withOfferTitle":
          "You received a new message about {offerTitle}.",
        relativeNow: "just now",
        relativeMinutesShort: "{count}m",
        relativeHoursShort: "{count}h",
        relativeDaysShort: "{count}d",
      }

      let text = translations[key] ?? key
      for (const [name, value] of Object.entries(values ?? {})) {
        text = text.replace(`{${name}}`, String(value))
      }
      return text
    },
}))

const invalidateQueriesMock = mock(() => {})
const markAllReadMutateMock = mock((_input?: unknown) => {})
const markReadMutateMock = mock((_input?: unknown) => {})

const queryState = {
  data: {
    unreadCount: 2,
    notifications: [] as Array<{
      id: string
      type: string
      payload: Record<string, unknown>
      createdAt: string
      readAt: string | null
    }>,
  },
}

let openChangeHandler: ((open: boolean) => void) | undefined

mock.module("@tanstack/react-query", () => ({
  QueryClient: class QueryClient {
    invalidateQueries() {}
    clear() {}
  },
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useQuery: () => ({ data: queryState.data }),
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
    clear: () => {},
  }),
  useMutation: (options?: {
    kind?: "markRead" | "markAllRead"
    onSuccess?: () => void
  }) => ({
    mutate: (input?: unknown) => {
      if (options?.kind === "markAllRead") {
        markAllReadMutateMock(input)
      } else {
        markReadMutateMock(input)
      }

      options?.onSuccess?.()
    },
    isPending: false,
  }),
}))

mock.module("lucide-react", () => ({
  Bell: () => <span>Bell</span>,
  CheckCheck: () => <span>CheckCheck</span>,
  Loader2: () => <span>Loader2</span>,
  ShieldAlert: () => <span>ShieldAlert</span>,
}))

mock.module("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({
    children,
    onOpenChange,
  }: {
    children: React.ReactNode
    onOpenChange?: (open: boolean) => void
  }) => {
    openChangeHandler = onOpenChange
    return <div>{children}</div>
  },
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuTrigger: ({
    children,
    onClick,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event)
        openChangeHandler?.(true)
      }}
    >
      {children}
    </button>
  ),
}))

mock.module("@/i18n/routing", () => ({
  Link: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}))

mock.module("@/server/orpc/client", () => ({
  orpcClient: {
    notifications: {
      list: async () => queryState.data,
    },
  },
  orpc: {
    notifications: {
      markRead: {
        mutationOptions: (options?: { onSuccess?: () => void }) => ({
          kind: "markRead" as const,
          ...options,
        }),
      },
      markAllRead: {
        mutationOptions: (options?: { onSuccess?: () => void }) => ({
          kind: "markAllRead" as const,
          ...options,
        }),
      },
    },
  },
}))

let importCounter = 0

async function loadNotificationBell() {
  importCounter += 1
  return import(`@/components/NotificationBell?test=${importCounter}`)
}

describe("src/components/NotificationBell", () => {
  beforeEach(() => {
    invalidateQueriesMock.mockClear()
    markAllReadMutateMock.mockClear()
    markReadMutateMock.mockClear()
    queryState.data = {
      unreadCount: 2,
      notifications: [],
    }
    openChangeHandler = undefined
  })

  test("marks all unread notifications when the bell dropdown opens", async () => {
    const { NotificationBell } = await loadNotificationBell()

    render(<NotificationBell viewerId="viewer-1" />)

    const trigger = screen.getByText("Bell").closest("button")
    if (!trigger) {
      throw new Error("Expected notification trigger button")
    }

    fireEvent.click(trigger)

    expect(markAllReadMutateMock).toHaveBeenCalledTimes(1)
    expect(markAllReadMutateMock).toHaveBeenCalledWith({})
    expect(markReadMutateMock).not.toHaveBeenCalled()
  })

  test("renders a message notification link that points to the related thread", async () => {
    queryState.data = {
      unreadCount: 1,
      notifications: [
        {
          id: "n-message",
          type: "new_message",
          payload: { threadId: "thread-24", offerTitle: "Backend Internship" },
          createdAt: "2026-02-18T10:00:00.000Z",
          readAt: null,
        },
      ],
    }

    const { NotificationBell } = await loadNotificationBell()

    render(<NotificationBell viewerId="viewer-1" />)

    expect(screen.getByRole("link", { name: /new message/i })).toHaveAttribute(
      "href",
      "/dashboard/messages?threadId=thread-24",
    )
  })
})
