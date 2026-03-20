import { beforeEach, describe, expect, mock, test } from "bun:test"

function createProcedureMock() {
  return {
    use() {
      return this
    },
    input() {
      return this
    },
    handler<T>(fn: T) {
      return fn
    },
  }
}

async function callProcedure<T>(procedure: unknown, args: unknown): Promise<T> {
  return (procedure as (input: unknown) => Promise<T>)(args)
}

const listNotificationsMock = mock(async () => ({
  items: [],
  nextCursor: null,
}))
const markNotificationReadMock = mock(async () => ({ success: true }))
const markAllNotificationsReadMock = mock(async () => ({ success: true }))
const getNotificationPreferencesMock = mock(async () => ({
  inAppEnabled: true,
  emailEnabled: true,
}))
const updateNotificationPreferencesMock = mock(async () => ({
  inAppEnabled: false,
  emailEnabled: true,
}))
const isFeatureEnabledMock = mock(() => true)

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  publicProcedureStrict: createProcedureMock(),
  publicProcedureStandard: createProcedureMock(),
  authedSessionProcedureStandard: createProcedureMock(),
  authedSessionProcedureGenerous: createProcedureMock(),
  authedProcedureGenerous: createProcedureMock(),
  authedProcedureStandard: createProcedureMock(),
  authedProcedureStrict: createProcedureMock(),
  adminProcedureGenerous: createProcedureMock(),
  adminProcedureStandard: createProcedureMock(),
  adminProcedureAssistant: createProcedureMock(),
  universityProcedureAssistant: createProcedureMock(),
  superAdminProcedureGenerous: createProcedureMock(),
  superAdminProcedureStandard: createProcedureMock(),
  assistantProcedureLimited: createProcedureMock(),
  companyAdminProcedureStandard: createProcedureMock(),
  companyAdminProcedureGenerous: createProcedureMock(),
  companyAdminProcedureAssistant: createProcedureMock(),
  studentProcedureStandard: createProcedureMock(),
  studentProcedureGenerous: createProcedureMock(),
  deptHeadProcedureStandard: createProcedureMock(),
  deptHeadProcedureGenerous: createProcedureMock(),
}))
mock.module("@/lib/feature-flags", () => ({
  FEATURE_FLAGS: {
    NOTIF_PREFERENCES: true,
    SAVED_OFFERS: true,
    INTERVIEWS: true,
    LANGUAGE_REQUIREMENTS: true,
  },
  isFeatureEnabled: isFeatureEnabledMock,
}))

mock.module("@/server/services/notifications/list", () => ({
  listNotifications: listNotificationsMock,
}))
mock.module("@/server/services/notifications/mark-read", () => ({
  markNotificationRead: markNotificationReadMock,
  markAllNotificationsRead: markAllNotificationsReadMock,
}))
mock.module("@/server/services/notifications/get-preferences", () => ({
  getNotificationPreferences: getNotificationPreferencesMock,
}))
mock.module("@/server/services/notifications/update-preferences", () => ({
  updateNotificationPreferences: updateNotificationPreferencesMock,
}))

describe("src/server/orpc/routes/notifications", () => {
  beforeEach(() => {
    listNotificationsMock.mockClear()
    markNotificationReadMock.mockClear()
    markAllNotificationsReadMock.mockClear()
    getNotificationPreferencesMock.mockClear()
    updateNotificationPreferencesMock.mockClear()
    isFeatureEnabledMock.mockClear()
    isFeatureEnabledMock.mockImplementation(() => true)
  })

  test("listNotificationsProcedure delegates with user and pagination input", async () => {
    const { listNotificationsProcedure } = await import(
      "@/server/orpc/routes/notifications"
    )

    const input = { limit: 20 }
    const result = await callProcedure(listNotificationsProcedure, {
      input,
      context: { user: { id: "user-1" } },
    })

    expect(result).toEqual({ items: [], nextCursor: null })
    expect(listNotificationsMock).toHaveBeenCalledWith("user-1", input)
  })

  test("markAllNotificationsReadProcedure delegates with user id", async () => {
    const { markAllNotificationsReadProcedure } = await import(
      "@/server/orpc/routes/notifications"
    )

    const result = await callProcedure(markAllNotificationsReadProcedure, {
      context: { user: { id: "user-1" } },
    })

    expect(result).toEqual({ success: true })
    expect(markAllNotificationsReadMock).toHaveBeenCalledWith("user-1")
  })

  test("getNotificationPreferencesProcedure delegates when feature is enabled", async () => {
    const { getNotificationPreferencesProcedure } = await import(
      "@/server/orpc/routes/notifications"
    )

    const result = await callProcedure(getNotificationPreferencesProcedure, {
      context: { user: { id: "user-1" } },
    })

    expect(result).toEqual({
      inAppEnabled: true,
      emailEnabled: true,
    })
    expect(isFeatureEnabledMock).toHaveBeenCalledWith("NOTIF_PREFERENCES")
    expect(getNotificationPreferencesMock).toHaveBeenCalledWith("user-1")
  })

  test("updateNotificationPreferencesProcedure delegates when feature is enabled", async () => {
    const { updateNotificationPreferencesProcedure } = await import(
      "@/server/orpc/routes/notifications"
    )

    const result = await callProcedure(updateNotificationPreferencesProcedure, {
      context: { user: { id: "user-1" } },
      input: { inAppEnabled: false },
    })

    expect(result).toEqual({
      inAppEnabled: false,
      emailEnabled: true,
    })
    expect(updateNotificationPreferencesMock).toHaveBeenCalledWith("user-1", {
      inAppEnabled: false,
    })
  })

  test("getNotificationPreferencesProcedure rejects when feature is disabled", async () => {
    isFeatureEnabledMock.mockImplementation(() => false)
    const { getNotificationPreferencesProcedure } = await import(
      "@/server/orpc/routes/notifications"
    )

    await expect(
      callProcedure(getNotificationPreferencesProcedure, {
        context: { user: { id: "user-1" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Notification preferences feature is disabled",
    })
  })
})
