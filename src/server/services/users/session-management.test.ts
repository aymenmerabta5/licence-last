import { beforeEach, describe, expect, mock, test } from "bun:test"

interface SessionItem {
  id: string
  token: string
}

const mockListSessions = mock<() => Promise<SessionItem[]>>(() =>
  Promise.resolve([]),
)
const mockRevokeSession = mock<() => Promise<{ status: boolean }>>(() =>
  Promise.resolve({ status: true }),
)
const mockRevokeOtherSessions = mock<() => Promise<{ status: boolean }>>(() =>
  Promise.resolve({ status: true }),
)
const mockHeaders = mock(() => Promise.resolve(new Headers()))

function applySessionManagementMocks() {
  mock.module("@/lib/auth", () => ({
    auth: {
      api: {
        listSessions: mockListSessions,
        revokeSession: mockRevokeSession,
        revokeOtherSessions: mockRevokeOtherSessions,
      },
    },
    pendingWelcomeEmails: new Map(),
  }))

  mock.module("next/headers", () => ({ headers: mockHeaders }))
}

let sessionManagementImportCounter = 0
async function importSessionManagement() {
  sessionManagementImportCounter += 1
  return import(
    `@/server/services/users/session-management?test=${sessionManagementImportCounter}`
  )
}

describe("src/server/services/users/session-management", () => {
  beforeEach(() => {
    applySessionManagementMocks()

    mockListSessions.mockClear()
    mockRevokeSession.mockClear()
    mockRevokeOtherSessions.mockClear()
    mockHeaders.mockClear()
    mockListSessions.mockResolvedValue([])
  })

  test("listMySessions should call auth.api.listSessions", async () => {
    const { listMySessions } = await importSessionManagement()

    const result = await listMySessions()

    expect(result).toEqual([])
    expect(mockListSessions).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockListSessions.mock.calls as any)[0][0]
    expect(call.headers).toBeInstanceOf(Headers)
  })

  test("revokeMySession should reject unknown session IDs", async () => {
    const { revokeMySession } = await importSessionManagement()
    mockListSessions.mockResolvedValue([{ id: "session-1", token: "token-1" }])

    await expect(revokeMySession("session-unknown")).rejects.toThrow(
      "Session not found or does not belong to you",
    )
    expect(mockRevokeSession).not.toHaveBeenCalled()
  })

  test("revokeMySession should revoke by session ID and resolve token server-side", async () => {
    const { revokeMySession } = await importSessionManagement()
    mockListSessions.mockResolvedValue([{ id: "session-1", token: "token-1" }])

    const result = await revokeMySession("session-1")

    expect(result).toEqual({ status: true })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockRevokeSession.mock.calls as any)[0][0]
    expect(call.body.token).toBe("token-1")
  })

  test("revokeOtherSessions should return 0 when no other sessions exist", async () => {
    const { revokeOtherSessions } = await importSessionManagement()
    mockListSessions.mockResolvedValue([{ id: "s1", token: "current-token" }])

    const result = await revokeOtherSessions("current-token")

    expect(result).toEqual({ revoked: 0 })
    expect(mockRevokeOtherSessions).not.toHaveBeenCalled()
  })

  test("revokeOtherSessions should revoke all non-current sessions", async () => {
    const { revokeOtherSessions } = await importSessionManagement()
    mockListSessions.mockResolvedValue([
      { id: "s1", token: "current-token" },
      { id: "s2", token: "other-token-1" },
      { id: "s3", token: "other-token-2" },
    ])

    const result = await revokeOtherSessions("current-token")

    expect(result).toEqual({ revoked: 2 })
    expect(mockRevokeOtherSessions).toHaveBeenCalledTimes(1)
  })
})
