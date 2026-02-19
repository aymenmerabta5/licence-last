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

mock.module("@/server/db", () => ({
  db: {
    select: () => {
      selectCallIdx++
      if (selectCallIdx === 1) return { from: mockFrom }
      return { from: mockUnreadFrom }
    },
  },
}))

describe("src/server/services/notifications/list", () => {
  beforeEach(() => {
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

    const { listNotifications } = await import(
      "@/server/services/notifications/list"
    )
    const result = await listNotifications("u-1", { limit: 10 })

    expect(result.notifications).toHaveLength(1)
    expect(result.unreadCount).toBe(2)
    expect(result.hasMore).toBe(false)
  })
})
