import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock((): any => Promise.resolve())

mock.module("@/server/db", () => ({
  db: {
    insert: mockInsert,
  },
}))

describe("src/server/services/notifications/create", () => {
  beforeEach(() => {
    mockInsert.mockClear()
    mockValues.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
  })

  test("should insert a notification", async () => {
    const { createNotification } = await import("@/server/services/notifications/create")
    const result = await createNotification({
      userId: "u-1",
      type: "test",
      payload: { a: 1 },
    })

    expect(result.id).toBeDefined()
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })
})
