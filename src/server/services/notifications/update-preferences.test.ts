import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockOnConflictDoUpdate = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockReturning = mock<() => Promise<any[]>>(() => Promise.resolve([]))

const getNotificationPreferencesMock = mock(async () => ({
  inAppEnabled: true,
  emailEnabled: true,
}))

mock.module("@/server/db", () => ({
  db: {
    insert: mockInsert,
  },
}))

mock.module("@/server/services/notifications/get-preferences", () => ({
  getNotificationPreferences: getNotificationPreferencesMock,
}))

describe("src/server/services/notifications/update-preferences", () => {
  beforeEach(() => {
    mockInsert.mockClear()
    mockValues.mockClear()
    mockOnConflictDoUpdate.mockClear()
    mockReturning.mockClear()
    getNotificationPreferencesMock.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockReturnValue({ onConflictDoUpdate: mockOnConflictDoUpdate })
    mockOnConflictDoUpdate.mockReturnValue({ returning: mockReturning })
    mockReturning.mockResolvedValue([{ inAppEnabled: false, emailEnabled: true }])
  })

  test("updates preferences with merged values", async () => {
    getNotificationPreferencesMock.mockResolvedValueOnce({
      inAppEnabled: true,
      emailEnabled: true,
    })

    const { updateNotificationPreferences } = await import(
      "@/server/services/notifications/update-preferences"
    )

    const result = await updateNotificationPreferences("user-1", {
      inAppEnabled: false,
    })

    expect(result).toEqual({ inAppEnabled: false, emailEnabled: true })
    expect(getNotificationPreferencesMock).toHaveBeenCalledWith("user-1")
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })
})
