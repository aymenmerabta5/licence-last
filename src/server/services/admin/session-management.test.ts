import { beforeEach, describe, expect, mock, test } from "bun:test"

interface MockSessionRecord {
  id: string
  token: string
}

const mockListUserSessions = mock(
  (): Promise<{ sessions: MockSessionRecord[] }> =>
    Promise.resolve({ sessions: [] }),
)
const mockRevokeUserSession = mock(() => Promise.resolve({ success: true }))
const mockRevokeUserSessions = mock(() => Promise.resolve({ success: true }))
const mockHeaders = mock(() => Promise.resolve(new Headers()))

mock.module("@/lib/auth", () => ({
  auth: { api: {} },
  pendingWelcomeEmails: new Map(),
}))

describe("listUserSessions", () => {
  beforeEach(() => {
    mockListUserSessions.mockClear()
  })

  test("should call auth.api.listUserSessions with userId", async () => {
    const { listUserSessions } = await import(
      "@/server/services/admin/session-management?fresh=1"
    )
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
    mockListUserSessions.mockClear()
    mockRevokeUserSession.mockClear()
  })

  test("should resolve the session token by user and session id before revoking", async () => {
    const { revokeSession } = await import(
      "@/server/services/admin/session-management?fresh=2"
    )
    mockListUserSessions.mockResolvedValueOnce({
      sessions: [{ id: "session-1", token: "session-token-abc" }],
    })

    await revokeSession("user-1", "session-1", {
      authApi: {
        listUserSessions: mockListUserSessions,
        revokeUserSession: mockRevokeUserSession,
        revokeUserSessions: mockRevokeUserSessions,
      },
      getHeaders: mockHeaders,
    })

    expect(mockListUserSessions).toHaveBeenCalledWith({
      body: { userId: "user-1" },
      headers: expect.any(Headers),
    })

    const call = (mockRevokeUserSession.mock.calls as unknown[][])[0][0] as {
      body: { sessionToken?: string }
    }
    expect(call.body.sessionToken).toBe("session-token-abc")
  })

  test("should return null when the session id does not belong to the user", async () => {
    const { revokeSession } = await import(
      "@/server/services/admin/session-management?fresh=5"
    )
    mockListUserSessions.mockResolvedValueOnce({
      sessions: [{ id: "session-1", token: "session-token-abc" }],
    })

    const result = await revokeSession("user-1", "missing-session", {
      authApi: {
        listUserSessions: mockListUserSessions,
        revokeUserSession: mockRevokeUserSession,
        revokeUserSessions: mockRevokeUserSessions,
      },
      getHeaders: mockHeaders,
    })

    expect(result).toBeNull()
    expect(mockRevokeUserSession).not.toHaveBeenCalled()
  })
})

describe("revokeAllSessions", () => {
  beforeEach(() => {
    mockRevokeUserSessions.mockClear()
  })

  test("should call auth.api.revokeUserSessions with userId", async () => {
    const { revokeAllSessions } = await import(
      "@/server/services/admin/session-management?fresh=3"
    )
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
    const { revokeAllSessions } = await import(
      "@/server/services/admin/session-management?fresh=4"
    )
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
