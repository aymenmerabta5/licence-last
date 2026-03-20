import { beforeEach, describe, expect, mock, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"

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
})
