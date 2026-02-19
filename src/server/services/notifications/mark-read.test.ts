import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUpdate = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSet = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhere = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockReturning = mock<() => Promise<any[]>>(() =>
  Promise.resolve([{ id: "n-1" }]),
)

mock.module("@/server/db", () => ({
  db: {
    update: mockUpdate,
  },
}))

describe("src/server/services/notifications/mark-read", () => {
  beforeEach(() => {
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
    mockReturning.mockResolvedValue([{ id: "n-1" }])
  })

  test("markNotificationRead should return updated count", async () => {
    const { markNotificationRead } = await import(
      "@/server/services/notifications/mark-read"
    )
    const result = await markNotificationRead("u-1", "n-1")
    expect(result.updated).toBe(1)
  })

  test("markAllNotificationsRead should return updated count", async () => {
    const { markAllNotificationsRead } = await import(
      "@/server/services/notifications/mark-read"
    )
    const result = await markAllNotificationsRead("u-1")
    expect(result.success).toBe(true)
  })
})
