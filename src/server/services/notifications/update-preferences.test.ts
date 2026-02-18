import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockOnConflictDoUpdate = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockReturning = mock<() => Promise<any[]>>(() => Promise.resolve([]))
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
    insert: mockInsert,
    select: mockSelect,
  },
}))

describe("src/server/services/notifications/update-preferences", () => {
  beforeEach(() => {
    mockInsert.mockClear()
    mockValues.mockClear()
    mockOnConflictDoUpdate.mockClear()
    mockReturning.mockClear()
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockReturnValue({ onConflictDoUpdate: mockOnConflictDoUpdate })
    mockOnConflictDoUpdate.mockReturnValue({ returning: mockReturning })
    mockReturning.mockResolvedValue([{ inAppEnabled: false, emailEnabled: true }])
    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockLimit.mockResolvedValue([{ inAppEnabled: true, emailEnabled: true }])
  })

  test("updates preferences with merged values", async () => {
    const { updateNotificationPreferences } = await import(
      "@/server/services/notifications/update-preferences"
    )

    const result = await updateNotificationPreferences("user-1", {
      inAppEnabled: false,
    })

    expect(result).toEqual({ inAppEnabled: false, emailEnabled: true })
    expect(mockSelect).toHaveBeenCalledTimes(1)
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })
})
