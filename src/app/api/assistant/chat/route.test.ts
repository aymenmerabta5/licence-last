import { describe, test, expect, beforeEach, mock } from "bun:test"
import type { UIMessage } from "ai"

// Mock next/headers
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
    universityId?: string | null
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

// Mock approval gate
const mockCheckAdminApproval = mock<
  () => Promise<{ ok: boolean; reason?: "company_pending" | "company_rejected" | "university_pending" | "university_rejected" }>
>()

mock.module("@/server/auth/approval-gate", () => ({
  checkAdminApproval: mockCheckAdminApproval,
}))

// Mock DB chain used by auth-context
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockDbLimitResult: any[] = []
const mockDbLimit = mock(() => Promise.resolve(mockDbLimitResult))
const mockDbWhere = mock(() => ({ limit: mockDbLimit }))
const mockDbFrom = mock(() => ({ where: mockDbWhere }))
const mockDbSelect = mock(() => ({ from: mockDbFrom }))

mock.module("@/server/db", () => ({
  db: {
    select: mockDbSelect,
  },
}))

// Mock rate limit
const mockCheckRateLimit = mock<() => Promise<{ ok: boolean; retryAfterMs: number }>>()

mock.module("@/server/ai/rate-limit", () => ({
  checkRateLimit: mockCheckRateLimit,
  _resetRateLimitForTests: () => {},
}))

// Mock AI SDK
mock.module("ai", () => ({
  convertToModelMessages: (msgs: UIMessage[]) => msgs,
  tool: <T>(definition: T) => definition,
  createUIMessageStream: ({ execute }: { execute: (args: { writer: { write: (chunk: string) => void } }) => Promise<void> }) => {
    return new ReadableStream({
      start(controller) {
        const writer = {
          write: (chunk: string) => {
            controller.enqueue(new TextEncoder().encode(chunk))
          },
        }
        execute({ writer }).then(() => controller.close()).catch(() => controller.close())
      },
    })
  },
  createUIMessageStreamResponse: ({ stream }: { stream: ReadableStream }) => {
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    })
  },
  stepCountIs: () => () => false,
  streamText: () => ({
    toUIMessageStream: async function* () {
      yield { role: "assistant", content: "Hello" }
    },
  }),
}))

// Mock access check
const mockIsRoleAllowedForIntent = mock<() => boolean>()

mock.module("@/server/ai/access", () => ({
  isRoleAllowedForIntent: mockIsRoleAllowedForIntent,
}))

// Mock assistant services
const mockResolvePersistence = mock<() => Promise<{ ok: boolean; status?: number; companyId?: string | null; modelId?: string | null }>>()
const mockGetAssistantConversationByIdForCompany = mock<() => Promise<{ title: string | null } | null>>()

mock.module("@/server/services/assistant/get", () => ({
  getAssistantConversationByIdForCompany: mockGetAssistantConversationByIdForCompany,
}))

mock.module("@/server/ai/persistence", () => ({
  resolvePersistence: mockResolvePersistence,
  persistUserMessage: mock(() => Promise.resolve()),
}))

mock.module("@/server/services/assistant/messages", () => ({
  appendAssistantMessage: mock(() => Promise.resolve()),
}))

mock.module("@/server/services/assistant/utils", () => ({
  extractTextFromParts: (parts: unknown[]) => parts.map((p: unknown) => (p as { text?: string }).text || "").join(""),
}))

// Mock assistant types
mock.module("@/server/ai/types", () => ({
  ASSISTANT_INTENTS: new Set(["search_offers", "view_application"]),
}))

// Mock AI utilities
mock.module("@/lib/ai/tool-output", () => ({
  asRecord: (val: unknown) => val as Record<string, unknown>,
  getStringProp: (rec: Record<string, unknown>, key: string) => (rec?.[key] as string) || undefined,
}))

// Mock sanitizer
mock.module("@/server/ai/sanitizer", () => ({
  sanitizeUIMessagesForModel: (msgs: UIMessage[]) => msgs,
  errorToText: (err: unknown) => String(err),
}))

// Mock prompts
mock.module("@/server/ai/prompts", () => ({
  resolvePersona: () => "general",
  buildSystemPrompt: () => "You are a helpful assistant.",
}))

// Mock internal tools
mock.module("@/server/ai/tools/internal", () => ({
  createInternalTools: () => ({}),
}))

// Mock arcade tools
mock.module("@/server/ai/tools/arcade", () => ({
  getArcadeTools: mock(() => Promise.resolve({})),
}))

// Mock gmail resolver
mock.module("@/server/ai/tools/gmail-resolver", () => ({
  shouldForceGmailTool: () => null,
  resolveGmailToolName: () => null,
  getLatestUserText: () => "",
}))

// Mock context
mock.module("@/server/ai/context", () => ({
  assistantContextToJson: () => "{}",
}))

// Mock model
mock.module("@/server/ai/model", () => ({
  getPoeModel: () => "gpt-4",
}))

// Mock auto-title
mock.module("@/server/ai/auto-title", () => ({
  generateConversationTitle: mock(() => Promise.resolve(null)),
}))

describe("src/app/api/assistant/chat/route", () => {
  beforeEach(() => {
    mockGetSession.mockClear()
    mockCheckRateLimit.mockClear()
    mockIsRoleAllowedForIntent.mockClear()
    mockResolvePersistence.mockClear()
    mockGetAssistantConversationByIdForCompany.mockClear()
    mockCheckAdminApproval.mockClear()
    mockDbSelect.mockClear()
    mockDbFrom.mockClear()
    mockDbWhere.mockClear()
    mockDbLimit.mockClear()
    mockHeadersData = {}

    // Default successful mocks
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", role: "company_admin" },
    })
    mockCheckAdminApproval.mockResolvedValue({ ok: true })
    mockCheckRateLimit.mockResolvedValue({ ok: true, retryAfterMs: 0 })
    mockIsRoleAllowedForIntent.mockReturnValue(true)
    mockResolvePersistence.mockResolvedValue({ ok: true, companyId: "company-1", modelId: null })
    mockGetAssistantConversationByIdForCompany.mockResolvedValue({ title: null })
    mockDbLimitResult = [{ companyId: "company-1" }]
  })

  describe("request validation", () => {
    test("invalid JSON returns 400", async () => {
      const { POST } = await import("@/app/api/assistant/chat/route")

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        body: "not valid json",
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      const body = await response.text()
      expect(body).toBe("Invalid JSON")
    })

    test("messages array too large returns 400", async () => {
      const { POST } = await import("@/app/api/assistant/chat/route")

      const messages = Array.from({ length: 101 }, (_, i) => ({
        id: `msg-${i}`,
        role: "user",
        content: "Hello",
        parts: [{ type: "text" as const, text: "Hello" }],
      }))

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      const body = await response.text()
      expect(body).toContain("Too many messages")
      expect(body).toContain("100")
    })

    test("total chars > 500k returns 400", async () => {
      const { POST } = await import("@/app/api/assistant/chat/route")

      const longText = "a".repeat(500001)
      const messages = [{
        id: "msg-1",
        role: "user",
        content: longText,
        parts: [{ type: "text" as const, text: longText }],
      }]

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      const body = await response.text()
      expect(body).toContain("Request too large")
      expect(body).toContain("500000")
    })

    test("exactly 500k chars is allowed", async () => {
      const { POST } = await import("@/app/api/assistant/chat/route")

      const exactText = "a".repeat(500000)
      const messages = [{
        id: "msg-1",
        role: "user",
        content: exactText,
        parts: [{ type: "text" as const, text: exactText }],
      }]

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      })

      const response = await POST(request)
      // Should not be 400 due to size
      expect(response.status).not.toBe(400)
    })

    test("invalid messages format returns 400", async () => {
      const { POST } = await import("@/app/api/assistant/chat/route")

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: "not an array" }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      const body = await response.text()
      expect(body).toBe("Invalid messages format")
    })
  })

  describe("authentication", () => {
    test("no session returns 401", async () => {
      mockGetSession.mockResolvedValue(null)

      const { POST } = await import("@/app/api/assistant/chat/route")

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            id: "msg-1",
            role: "user",
            content: "Hello",
            parts: [{ type: "text", text: "Hello" }],
          }],
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
      const body = await response.text()
      expect(body).toBe("Unauthorized")
    })
  })

  describe("authorization", () => {
    test("RBAC fails returns 403", async () => {
      mockIsRoleAllowedForIntent.mockReturnValue(false)

      const { POST } = await import("@/app/api/assistant/chat/route")

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            id: "msg-1",
            role: "user",
            content: "Hello",
            parts: [{ type: "text", text: "Hello" }],
          }],
          context: { intent: "search_offers" },
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(403)
      const body = await response.text()
      expect(body).toBe("Forbidden")
    })

    test("pending company_admin returns 403 before RBAC intent checks", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "user-1", role: "company_admin", onboardingCompleted: true },
      })
      mockCheckAdminApproval.mockResolvedValue({ ok: false, reason: "company_pending" })

      const { POST } = await import("@/app/api/assistant/chat/route")

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            id: "msg-1",
            role: "user",
            content: "Hello",
            parts: [{ type: "text", text: "Hello" }],
          }],
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(403)
      const body = await response.text()
      expect(body).toBe("Forbidden")
    })
  })

  describe("conversation persistence", () => {
    test("conversation not found returns 404", async () => {
      mockResolvePersistence.mockResolvedValue({ ok: false, status: 404 })

      const { POST } = await import("@/app/api/assistant/chat/route")

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            id: "msg-1",
            role: "user",
            content: "Hello",
            parts: [{ type: "text", text: "Hello" }],
          }],
          conversationId: "conv-123",
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(404)
      const body = await response.text()
      expect(body).toBe("Conversation not found")
    })

    test("persistence forbidden returns 403", async () => {
      mockResolvePersistence.mockResolvedValue({ ok: false, status: 403 })

      const { POST } = await import("@/app/api/assistant/chat/route")

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            id: "msg-1",
            role: "user",
            content: "Hello",
            parts: [{ type: "text", text: "Hello" }],
          }],
          conversationId: "conv-123",
        }),
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
        retryAfterMs: 30000,
      })

      const { POST } = await import("@/app/api/assistant/chat/route")

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            id: "msg-1",
            role: "user",
            content: "Hello",
            parts: [{ type: "text", text: "Hello" }],
          }],
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(429)
      expect(response.headers.get("retry-after")).toBe("30")
      const body = await response.text()
      expect(body).toBe("Too Many Requests")
    })

    test("rate limit check uses correct key format", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "user-456", role: "company_admin" },
      })

      const { POST } = await import("@/app/api/assistant/chat/route")

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            id: "msg-1",
            role: "user",
            content: "Hello",
            parts: [{ type: "text", text: "Hello" }],
          }],
        }),
      })

      await POST(request)

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "assistant:chat:user-456",
          limit: 20,
          windowMs: 60000,
        }),
      )
    })
  })

  describe("success", () => {
    test("success returns streaming response", async () => {
      const { POST } = await import("@/app/api/assistant/chat/route")

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            id: "msg-1",
            role: "user",
            content: "Hello",
            parts: [{ type: "text", text: "Hello" }],
          }],
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
      expect(response.headers.get("Content-Type")).toContain("text/plain")
    })

    test("handles multiple messages correctly", async () => {
      const { POST } = await import("@/app/api/assistant/chat/route")

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              id: "msg-1",
              role: "user",
              content: "Hello",
              parts: [{ type: "text", text: "Hello" }],
            },
            {
              id: "msg-2",
              role: "assistant",
              content: "Hi there",
              parts: [{ type: "text", text: "Hi there" }],
            },
            {
              id: "msg-3",
              role: "user",
              content: "How are you?",
              parts: [{ type: "text", text: "How are you?" }],
            },
          ],
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    test("works without conversationId", async () => {
      mockResolvePersistence.mockResolvedValue({ ok: false, status: 403 }) // Should not be called

      const { POST } = await import("@/app/api/assistant/chat/route")

      const request = new Request("http://localhost:3000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            id: "msg-1",
            role: "user",
            content: "Hello",
            parts: [{ type: "text", text: "Hello" }],
          }],
          // No conversationId
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
      expect(mockResolvePersistence).not.toHaveBeenCalled()
    })
  })
})
