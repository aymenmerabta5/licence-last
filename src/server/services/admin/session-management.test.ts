import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockListUserSessions = mock(() => Promise.resolve({ sessions: [] }))
const mockRevokeUserSession = mock(() => Promise.resolve({ success: true }))
const mockRevokeUserSessions = mock(() => Promise.resolve({ success: true }))
const mockHeaders = mock(() => Promise.resolve(new Headers()))

mock.module("@/lib/auth", () => ({
  auth: {
    api: {
      listUserSessions: mockListUserSessions,
      revokeUserSession: mockRevokeUserSession,
      revokeUserSessions: mockRevokeUserSessions,
    },
  },
  pendingWelcomeEmails: new Map(),
}))
mock.module("next/headers", () => ({ headers: mockHeaders }))

describe("listUserSessions", () => {
  beforeEach(() => mockListUserSessions.mockClear())

  test("should call auth.api.listUserSessions with userId", async () => {
    const { listUserSessions } = await import("./session-management")
    await listUserSessions("user-1")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockListUserSessions.mock.calls as any)[0][0]
    expect(call.body.userId).toBe("user-1")
  })
})

describe("revokeSession", () => {
  beforeEach(() => mockRevokeUserSession.mockClear())

  test("should call auth.api.revokeUserSession with token", async () => {
    const { revokeSession } = await import("./session-management")
    await revokeSession("session-token-abc")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockRevokeUserSession.mock.calls as any)[0][0]
    expect(call.body.sessionToken).toBe("session-token-abc")
  })
})

describe("revokeAllSessions", () => {
  beforeEach(() => mockRevokeUserSessions.mockClear())

  test("should call auth.api.revokeUserSessions with userId", async () => {
    const { revokeAllSessions } = await import("./session-management")
    await revokeAllSessions("user-1")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockRevokeUserSessions.mock.calls as any)[0][0]
    expect(call.body.userId).toBe("user-1")
  })

  test("should return success result", async () => {
    const { revokeAllSessions } = await import("./session-management")
    const result = await revokeAllSessions("user-1")
    expect(result).toEqual({ success: true })
  })
})
