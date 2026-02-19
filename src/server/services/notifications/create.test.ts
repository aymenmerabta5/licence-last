import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock((): any => Promise.resolve())
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

describe("src/server/services/notifications/create", () => {
  beforeEach(() => {
    mockInsert.mockClear()
    mockValues.mockClear()
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockLimit.mockResolvedValue([
      {
        inAppEnabled: true,
        emailEnabled: true,
      },
    ])
  })

  test("should insert a notification", async () => {
    const { createNotification } = await import(
      "@/server/services/notifications/create?fresh=1" as string
    )
    const result = await createNotification({
      userId: "u-1",
      type: "test",
      payload: { a: 1 },
    })

    expect(result.id).toBeDefined()
    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(result.skipped).toBe(false)
  })

  test("should skip insert when in-app notifications are disabled", async () => {
    mockLimit.mockResolvedValueOnce([
      {
        inAppEnabled: false,
        emailEnabled: true,
      },
    ])

    const { createNotification } = await import(
      "@/server/services/notifications/create?fresh=2" as string
    )
    const result = await createNotification({
      userId: "u-1",
      type: "test",
      payload: { a: 1 },
    })

    expect(result).toEqual({ id: null, skipped: true })
    expect(mockInsert).not.toHaveBeenCalled()
  })
})
