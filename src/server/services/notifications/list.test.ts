import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockRows: any[] = []
let selectCallIdx = 0

// query 1
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit = mock<() => Promise<any[]>>(() => Promise.resolve(mockRows))
const mockOrderBy = mock(() => ({ limit: mockLimit }))
const mockWhere = mock(() => ({ orderBy: mockOrderBy }))
const mockFrom = mock(() => ({ where: mockWhere }))

// query 2 (unread count)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUnreadWhere = mock<() => Promise<any[]>>(() =>
  Promise.resolve([{ value: 2 }]),
)
const mockUnreadFrom = mock(() => ({ where: mockUnreadWhere }))

function applyListNotificationsMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: () => {
        selectCallIdx++
        if (selectCallIdx === 1) return { from: mockFrom }
        return { from: mockUnreadFrom }
      },
    },
  }))
}

let listNotificationsImportCounter = 0
async function importListNotifications() {
  listNotificationsImportCounter += 1
  return (await import(
    `@/server/services/notifications/list?test=${listNotificationsImportCounter}`
  )) as typeof import("@/server/services/notifications/list")
}

describe("src/server/services/notifications/list", () => {
  beforeEach(() => {
    applyListNotificationsMocks()

    selectCallIdx = 0
    mockRows = []

    mockLimit.mockClear()
    mockOrderBy.mockClear()
    mockWhere.mockClear()
    mockFrom.mockClear()
    mockUnreadWhere.mockClear()
    mockUnreadFrom.mockClear()

    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ orderBy: mockOrderBy })
    mockOrderBy.mockReturnValue({ limit: mockLimit })
    mockUnreadFrom.mockReturnValue({ where: mockUnreadWhere })
  })

  test("should return notifications with unreadCount", async () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z")
    mockRows = [
      {
        id: "n-1",
        type: "new_application",
        payload: { offerTitle: "Offer" },
        readAt: null,
        createdAt,
      },
    ]

    const { listNotifications } = await importListNotifications()
    const result = await listNotifications("u-1", { limit: 10 })

    expect(result.notifications).toHaveLength(1)
    expect(result.unreadCount).toBe(2)
    expect(result.hasMore).toBe(false)
    expect(mockOrderBy.mock.calls[0]).toHaveLength(2)
  })

  test("should expose a nextCursor when another page exists", async () => {
    mockRows = [
      {
        id: "n-3",
        type: "new_message",
        payload: {},
        readAt: null,
        createdAt: new Date("2025-01-03T00:00:00.000Z"),
      },
      {
        id: "n-2",
        type: "new_message",
        payload: {},
        readAt: null,
        createdAt: new Date("2025-01-02T00:00:00.000Z"),
      },
      {
        id: "n-1",
        type: "new_message",
        payload: {},
        readAt: null,
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
      },
    ]

    const { listNotifications } = await importListNotifications()
    const result = await listNotifications("u-1", { limit: 2 })

    expect(result.notifications).toHaveLength(2)
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toEqual({
      createdAt: "2025-01-02T00:00:00.000Z",
      id: "n-2",
    })
  })
})
