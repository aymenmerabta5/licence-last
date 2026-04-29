import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockSelect = mock(() => ({}) as any)

const mockFrom = mock(() => ({}) as any)

const mockWhere = mock(() => ({}) as any)

const mockLimit = mock<() => Promise<any[]>>(() => Promise.resolve([]))

function applyGetPreferencesMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
    },
  }))
}

let getPreferencesImportCounter = 0
async function importGetPreferences() {
  getPreferencesImportCounter += 1
  return (await import(
    `@/server/services/notifications/get-preferences?test=${getPreferencesImportCounter}`
  )) as typeof import("@/server/services/notifications/get-preferences")
}

describe("src/server/services/notifications/get-preferences", () => {
  beforeEach(() => {
    applyGetPreferencesMocks()

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

    const { getNotificationPreferences } = await importGetPreferences()

    const result = await getNotificationPreferences("user-1")

    expect(result).toEqual({
      inAppEnabled: true,
      emailEnabled: true,
    })
  })

  test("returns stored preferences when row exists", async () => {
    mockLimit.mockResolvedValue([{ inAppEnabled: false, emailEnabled: true }])

    const { getNotificationPreferences } = await importGetPreferences()

    const result = await getNotificationPreferences("user-2")

    expect(result).toEqual({
      inAppEnabled: false,
      emailEnabled: true,
    })
  })
})
