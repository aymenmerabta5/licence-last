import { describe, test, expect, beforeEach, mock } from "bun:test"

// Mock headers
let mockHeadersData: Record<string, string> = {}

mock.module("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => mockHeadersData[name.toLowerCase()] || null,
    has: (name: string) => name.toLowerCase() in mockHeadersData,
  }),
}))

// Mock CSRF
mock.module("@/lib/csrf", () => ({
  isValidOrigin: () => true,
}))

// Mock auth
const mockGetSession = mock<() => Promise<{
  user: {
    id: string
    role: string
    onboardingCompleted?: boolean
  }
} | null>>()

mock.module("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
  pendingWelcomeEmails: new Map(),
}))

// Mock rate limit
const mockCheckRateLimit = mock<() => Promise<{ ok: boolean; retryAfterMs: number }>>()

mock.module("@/server/ai/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
}))

// Mock Arcade
const mockAuthorize = mock<() => Promise<{ status: string; url: string }>>()

mock.module("@arcadeai/arcadejs", () => ({
  default: class Arcade {
    tools = {
      authorize: mockAuthorize,
    }
  },
}))

// Mock env
mock.module("@/env", () => ({
  env: {
    ARCADE_API_KEY: "test-api-key",
  },
}))

// Mock DB chain used by approval gate
const mockDbLimit = mock<() => Promise<Array<{ status: string }>>>()
const mockDbWhere = mock(() => ({ limit: mockDbLimit }))
const mockDbInnerJoin = mock(() => ({ where: mockDbWhere }))
const mockDbFrom = mock(() => ({ innerJoin: mockDbInnerJoin, where: mockDbWhere }))
const mockDbSelect = mock(() => ({ from: mockDbFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockDbSelect,
  },
}))

describe("src/app/api/assistant/auth/status/route", () => {
  beforeEach(() => {
    mockGetSession.mockClear()
    mockCheckRateLimit.mockClear()
    mockAuthorize.mockClear()
    mockDbSelect.mockClear()
    mockDbFrom.mockClear()
    mockDbInnerJoin.mockClear()
    mockDbWhere.mockClear()
    mockDbLimit.mockClear()
    mockHeadersData = {}

    // Default successful mocks
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", role: "company_admin" },
    })
    mockCheckRateLimit.mockResolvedValue({ ok: true, retryAfterMs: 0 })
    mockAuthorize.mockResolvedValue({ status: "completed", url: "http://auth.url" })
    mockDbLimit.mockResolvedValue([{ status: "approved" }])
  })

  describe("request validation", () => {
    test("invalid JSON returns 400", async () => {
      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        body: "not valid json",
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      const body = await response.text()
      expect(body).toBe("Invalid JSON")
    })

    test("missing toolName returns 400", async () => {
      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      const body = await response.text()
      expect(body).toBe("toolName is required")
    })

    test("empty string toolName returns 400", async () => {
      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: "" }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      const body = await response.text()
      expect(body).toBe("toolName is required")
    })

    test("whitespace-only toolName returns 400", async () => {
      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: "   " }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      const body = await response.text()
      expect(body).toBe("toolName is required")
    })

    test("non-string toolName returns 400", async () => {
      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: 123 }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      const body = await response.text()
      expect(body).toBe("toolName is required")
    })
  })

  describe("authentication", () => {
    test("no session returns 401", async () => {
      mockGetSession.mockResolvedValue(null)

      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: "gmail.send" }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
      const body = await response.text()
      expect(body).toBe("Unauthorized")
    })
  })

  describe("authorization", () => {
    test("student role returns 403", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "user-1", role: "student" },
      })

      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: "gmail.send" }),
      })

      const response = await POST(request)
      expect(response.status).toBe(403)
      const body = await response.text()
      expect(body).toBe("Forbidden")
    })

    test("university_admin role returns 403", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "user-1", role: "university_admin" },
      })

      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: "gmail.send" }),
      })

      const response = await POST(request)
      expect(response.status).toBe(403)
      const body = await response.text()
      expect(body).toBe("Forbidden")
    })

    test("super_admin role returns 403", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "user-1", role: "super_admin" },
      })

      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: "gmail.send" }),
      })

      const response = await POST(request)
      expect(response.status).toBe(403)
      const body = await response.text()
      expect(body).toBe("Forbidden")
    })

    test("pending company_admin returns 403", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "user-1", role: "company_admin", onboardingCompleted: true },
      })
      mockDbLimit.mockResolvedValue([{ status: "pending" }])

      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: "gmail.send" }),
      })

      const response = await POST(request)
      expect(response.status).toBe(403)
      const body = await response.text()
      expect(body).toBe("Forbidden")
    })
  })

  describe("rate limiting", () => {
    test("rate limited returns 429 with retry-after header", async () => {
      mockCheckRateLimit.mockResolvedValue({
        ok: false,
        retryAfterMs: 45000,
      })

      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: "gmail.send" }),
      })

      const response = await POST(request)
      expect(response.status).toBe(429)
      expect(response.headers.get("retry-after")).toBe("45")
      const body = await response.text()
      expect(body).toBe("Too Many Requests")
    })

    test("rate limit check uses correct key format", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "user-123", role: "company_admin" },
      })

      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: "gmail.send" }),
      })

      await POST(request)

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "assistant:auth:user-123",
          limit: 60,
          windowMs: 60000,
        }),
      )
    })
  })

  describe("success", () => {
    test("success returns 200 with status and url", async () => {
      mockAuthorize.mockResolvedValue({
        status: "pending",
        url: "https://auth.arcade.com/123",
      })

      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: "gmail.send" }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toEqual({
        status: "pending",
        url: "https://auth.arcade.com/123",
      })
    })

    test("success passes correct parameters to Arcade", async () => {
      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: "github.create_issue" }),
      })

      await POST(request)

      expect(mockAuthorize).toHaveBeenCalledWith({
        tool_name: "github.create_issue",
        user_id: "user-1",
      })
    })

    test("null status and url are returned as null", async () => {
      mockAuthorize.mockResolvedValue({
        status: null as unknown as string,
        url: null as unknown as string,
      })

      const { POST } = await import("@/app/api/assistant/auth/status/route")

      const request = new Request("http://localhost:3000/api/assistant/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName: "gmail.send" }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toEqual({
        status: null,
        url: null,
      })
    })
  })
})
