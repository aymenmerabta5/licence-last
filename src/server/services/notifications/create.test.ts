import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockInsert = mock(() => ({}) as any)

const mockValues = mock((): any => Promise.resolve())
const mockGetNotificationPreferences = mock(() =>
  Promise.resolve({
    inAppEnabled: true,
    emailEnabled: true,
  }),
)

function applyCreateNotificationMocks() {
  mock.module("@/server/db", () => ({
    db: {
      insert: mockInsert,
    },
  }))

  mock.module("@/server/services/notifications/get-preferences", () => ({
    getNotificationPreferences: mockGetNotificationPreferences,
  }))
}

let createNotificationImportCounter = 0
async function importCreateNotification() {
  createNotificationImportCounter += 1
  return (await import(
    `@/server/services/notifications/create?test=${createNotificationImportCounter}`
  )) as typeof import("@/server/services/notifications/create")
}

describe("src/server/services/notifications/create", () => {
  beforeEach(() => {
    applyCreateNotificationMocks()

    mockInsert.mockClear()
    mockValues.mockClear()
    mockGetNotificationPreferences.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
    mockGetNotificationPreferences.mockResolvedValue({
      inAppEnabled: true,
      emailEnabled: true,
    })
  })

  test("should insert a notification", async () => {
    const { createNotification } = await importCreateNotification()
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
    mockGetNotificationPreferences.mockResolvedValueOnce({
      inAppEnabled: false,
      emailEnabled: true,
    })

    const { createNotification } = await importCreateNotification()
    const result = await createNotification({
      userId: "u-1",
      type: "test",
      payload: { a: 1 },
    })

    expect(result).toEqual({ id: null, skipped: true })
    expect(mockInsert).not.toHaveBeenCalled()
  })
})
