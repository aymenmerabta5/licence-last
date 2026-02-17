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

const listNotificationsMock = mock(async () => ({ items: [], nextCursor: null }))
const markNotificationReadMock = mock(async () => ({ success: true }))
const markAllNotificationsReadMock = mock(async () => ({ success: true }))

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  authedProcedureGenerous: createProcedureMock(),
  authedProcedureStandard: createProcedureMock(),
}))

mock.module("@/server/services/notifications/list", () => ({
  listNotifications: listNotificationsMock,
}))
mock.module("@/server/services/notifications/mark-read", () => ({
  markNotificationRead: markNotificationReadMock,
  markAllNotificationsRead: markAllNotificationsReadMock,
}))

describe("src/server/orpc/routes/notifications", () => {
  beforeEach(() => {
    listNotificationsMock.mockClear()
    markNotificationReadMock.mockClear()
    markAllNotificationsReadMock.mockClear()
  })

  test("listNotificationsProcedure delegates with user and pagination input", async () => {
    const { listNotificationsProcedure } = await import("@/server/orpc/routes/notifications")

    const input = { limit: 20 }
    const result = await callProcedure(listNotificationsProcedure, {
      input,
      context: { user: { id: "user-1" } },
    })

    expect(result).toEqual({ items: [], nextCursor: null })
    expect(listNotificationsMock).toHaveBeenCalledWith("user-1", input)
  })

  test("markAllNotificationsReadProcedure delegates with user id", async () => {
    const { markAllNotificationsReadProcedure } = await import("@/server/orpc/routes/notifications")

    const result = await callProcedure(markAllNotificationsReadProcedure, {
      context: { user: { id: "user-1" } },
    })

    expect(result).toEqual({ success: true })
    expect(markAllNotificationsReadMock).toHaveBeenCalledWith("user-1")
  })
})
