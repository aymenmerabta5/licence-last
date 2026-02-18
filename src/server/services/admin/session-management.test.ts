import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockListUserSessions = mock(() => Promise.resolve({ sessions: [] }))
const mockRevokeUserSession = mock(() => Promise.resolve({ success: true }))
const mockRevokeUserSessions = mock(() => Promise.resolve({ success: true }))
const mockHeaders = mock(() => Promise.resolve(new Headers()))

mock.module("@/lib/auth", () => ({ auth: { api: {} }, pendingWelcomeEmails: new Map() }))

describe("listUserSessions", () => {
  beforeEach(() => {
    mockListUserSessions.mockClear()
  })

  test("should call auth.api.listUserSessions with userId", async () => {
    const { listUserSessions } = await import("@/server/services/admin/session-management?fresh=1")
    await listUserSessions("user-1", {
      authApi: {
        listUserSessions: mockListUserSessions,
        revokeUserSession: mockRevokeUserSession,
        revokeUserSessions: mockRevokeUserSessions,
      },
      getHeaders: mockHeaders,
    })
    const call = (mockListUserSessions.mock.calls as unknown[][])[0][0] as {
      body: { userId?: string }
    }
    expect(call.body.userId).toBe("user-1")
  })
})

describe("revokeSession", () => {
  beforeEach(() => {
    mockRevokeUserSession.mockClear()
  })

  test("should call auth.api.revokeUserSession with token", async () => {
    const { revokeSession } = await import("@/server/services/admin/session-management?fresh=2")
    await revokeSession("session-token-abc", {
      authApi: {
        listUserSessions: mockListUserSessions,
        revokeUserSession: mockRevokeUserSession,
        revokeUserSessions: mockRevokeUserSessions,
      },
      getHeaders: mockHeaders,
    })
    const call = (mockRevokeUserSession.mock.calls as unknown[][])[0][0] as {
      body: { sessionToken?: string }
    }
    expect(call.body.sessionToken).toBe("session-token-abc")
  })
})

describe("revokeAllSessions", () => {
  beforeEach(() => {
    mockRevokeUserSessions.mockClear()
  })

  test("should call auth.api.revokeUserSessions with userId", async () => {
    const { revokeAllSessions } = await import("@/server/services/admin/session-management?fresh=3")
    await revokeAllSessions("user-1", {
      authApi: {
        listUserSessions: mockListUserSessions,
        revokeUserSession: mockRevokeUserSession,
        revokeUserSessions: mockRevokeUserSessions,
      },
      getHeaders: mockHeaders,
    })
    const call = (mockRevokeUserSessions.mock.calls as unknown[][])[0][0] as {
      body: { userId?: string }
    }
    expect(call.body.userId).toBe("user-1")
  })

  test("should return success result", async () => {
    const { revokeAllSessions } = await import("@/server/services/admin/session-management?fresh=4")
    const result = await revokeAllSessions("user-1", {
      authApi: {
        listUserSessions: mockListUserSessions,
        revokeUserSession: mockRevokeUserSession,
        revokeUserSessions: mockRevokeUserSessions,
      },
      getHeaders: mockHeaders,
    })
    expect(result).toEqual({ success: true })
  })
})
