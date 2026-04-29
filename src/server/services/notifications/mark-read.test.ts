import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockUpdate = mock(() => ({}) as any)

const mockSet = mock(() => ({}) as any)

const mockWhere = mock(() => ({}) as any)

const mockReturning = mock<() => Promise<any[]>>(() =>
  Promise.resolve([{ id: "n-1" }]),
)

function applyMarkReadMocks() {
  mock.module("@/server/db", () => ({
    db: {
      update: mockUpdate,
    },
  }))
}

let markReadImportCounter = 0
async function importMarkRead() {
  markReadImportCounter += 1
  return (await import(
    `@/server/services/notifications/mark-read?test=${markReadImportCounter}`
  )) as typeof import("@/server/services/notifications/mark-read")
}

describe("src/server/services/notifications/mark-read", () => {
  beforeEach(() => {
    applyMarkReadMocks()

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
    const { markNotificationRead } = await importMarkRead()
    const result = await markNotificationRead("u-1", "n-1")
    expect(result.updated).toBe(1)
  })

  test("markAllNotificationsRead should return updated count", async () => {
    const { markAllNotificationsRead } = await importMarkRead()
    const result = await markAllNotificationsRead("u-1")
    expect(result.success).toBe(true)
  })
})
