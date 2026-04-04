import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockOnConflictDoUpdate = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockReturning = mock<() => Promise<any[]>>(() => Promise.resolve([]))
const mockGetNotificationPreferences = mock(() =>
  Promise.resolve({ inAppEnabled: true, emailEnabled: true }),
)

function applyUpdatePreferencesMocks() {
  mock.module("@/server/db", () => ({
    db: {
      insert: mockInsert,
    },
  }))

  mock.module("@/server/services/notifications/get-preferences", () => ({
    getNotificationPreferences: mockGetNotificationPreferences,
  }))
}

let updatePreferencesImportCounter = 0
async function importUpdatePreferences() {
  updatePreferencesImportCounter += 1
  return (await import(
    `@/server/services/notifications/update-preferences?test=${updatePreferencesImportCounter}`
  )) as typeof import("@/server/services/notifications/update-preferences")
}

describe("src/server/services/notifications/update-preferences", () => {
  beforeEach(() => {
    applyUpdatePreferencesMocks()

    mockInsert.mockClear()
    mockValues.mockClear()
    mockOnConflictDoUpdate.mockClear()
    mockReturning.mockClear()
    mockGetNotificationPreferences.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockReturnValue({ onConflictDoUpdate: mockOnConflictDoUpdate })
    mockOnConflictDoUpdate.mockReturnValue({ returning: mockReturning })
    mockReturning.mockResolvedValue([
      { inAppEnabled: false, emailEnabled: true },
    ])
    mockGetNotificationPreferences.mockResolvedValue({
      inAppEnabled: true,
      emailEnabled: true,
    })
  })

  test("updates preferences with merged values", async () => {
    const { updateNotificationPreferences } = await importUpdatePreferences()

    const result = await updateNotificationPreferences("user-1", {
      inAppEnabled: false,
    })

    expect(result).toEqual({ inAppEnabled: false, emailEnabled: true })
    expect(mockGetNotificationPreferences).not.toHaveBeenCalled()
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })

  test("does not read current preferences before a partial update", async () => {
    const { updateNotificationPreferences } = await importUpdatePreferences()

    await updateNotificationPreferences("user-1", {
      inAppEnabled: false,
    })

    expect(mockGetNotificationPreferences).not.toHaveBeenCalled()
  })
})
