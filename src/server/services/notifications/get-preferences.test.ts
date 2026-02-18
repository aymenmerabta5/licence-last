import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSelect = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFrom = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockWhere = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit = mock<() => Promise<any[]>>(() => Promise.resolve([]))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
  },
}))

describe("src/server/services/notifications/get-preferences", () => {
  beforeEach(() => {
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
  })

  test("returns defaults when no row exists", async () => {
    mockLimit.mockResolvedValue([])

    const { getNotificationPreferences } = await import(
      "@/server/services/notifications/get-preferences"
    )

    const result = await getNotificationPreferences("user-1")

    expect(result).toEqual({
      inAppEnabled: true,
      emailEnabled: true,
    })
  })

  test("returns stored preferences when row exists", async () => {
    mockLimit.mockResolvedValue([{ inAppEnabled: false, emailEnabled: true }])

    const { getNotificationPreferences } = await import(
      "@/server/services/notifications/get-preferences"
    )

    const result = await getNotificationPreferences("user-2")

    expect(result).toEqual({
      inAppEnabled: false,
      emailEnabled: true,
    })
  })
})
