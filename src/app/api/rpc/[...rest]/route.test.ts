import { describe, test, expect, beforeEach, mock } from "bun:test"

// Mock CSRF — must be explicit since mock.module is process-global
const mockIsValidOrigin = mock<(req: Request) => boolean>()

mock.module("@/lib/csrf", () => ({
  isValidOrigin: mockIsValidOrigin,
}))

// Mock env module
const mockEnv = {
  NEXT_PUBLIC_BETTER_AUTH_URL: "http://localhost:3000",
}

mock.module("@/env", () => ({
  env: mockEnv,
}))

// Mock RPCHandler
const mockHandle = mock<(request: Request, options: { prefix: string }) => Promise<{ response: Response }>>()

mock.module("@orpc/server/fetch", () => ({
  RPCHandler: mock(() => ({
    handle: mockHandle,
  })),
}))

// Mock onError
mock.module("@orpc/server", () => ({
  onError: () => {},
}))

// Mock appRouter
mock.module("@/server/orpc/router", () => ({
  appRouter: {},
}))

describe("src/app/api/rpc/[...rest]/route", () => {
  beforeEach(() => {
    mockHandle.mockClear()
    mockIsValidOrigin.mockClear()
    mockHandle.mockResolvedValue({
      response: new Response("OK", { status: 200 }),
    })
    // Default: simulate real CSRF behavior based on method + origin
    mockIsValidOrigin.mockImplementation((req: Request) => {
      if (req.method === "GET" || req.method === "HEAD") return true
      const origin = req.headers.get("origin")
      if (!origin) return false
      return origin === mockEnv.NEXT_PUBLIC_BETTER_AUTH_URL
    })
  })

  describe("CSRF protection", () => {
    test("GET requests allow any origin", async () => {
      const { GET } = await import("./route")

      const request = new Request("http://localhost:3000/api/rpc/test", {
        method: "GET",
        headers: {
          origin: "http://malicious-site.com",
        },
      })

      const response = await GET(request)
      expect(response.status).toBe(200)
    })

    test("POST without Origin header returns 403", async () => {
      const { POST } = await import("./route")

      const request = new Request("http://localhost:3000/api/rpc/test", {
        method: "POST",
        headers: {},
      })

      const response = await POST(request)
      expect(response.status).toBe(403)
      const body = await response.text()
      expect(body).toBe("Forbidden: invalid origin")
    })

    test("POST with invalid origin returns 403", async () => {
      const { POST } = await import("./route")

      const request = new Request("http://localhost:3000/api/rpc/test", {
        method: "POST",
        headers: {
          origin: "http://malicious-site.com",
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(403)
      const body = await response.text()
      expect(body).toBe("Forbidden: invalid origin")
    })

    test("POST with valid origin returns 200", async () => {
      const { POST } = await import("./route")

      const request = new Request("http://localhost:3000/api/rpc/test", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
        },
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    test("GET requests without origin header succeed", async () => {
      const { GET } = await import("./route")

      const request = new Request("http://localhost:3000/api/rpc/test", {
        method: "GET",
        headers: {},
      })

      const response = await GET(request)
      expect(response.status).toBe(200)
    })

    test("GET requests allow any origin even from malicious sites", async () => {
      const { GET } = await import("./route")

      const request = new Request("http://localhost:3000/api/rpc/test", {
        method: "GET",
        headers: {
          origin: "http://malicious-site.com",
        },
      })

      const response = await GET(request)
      expect(response.status).toBe(200)
    })
  })

  describe("RPCHandler integration", () => {
    beforeEach(() => {
      // Allow all requests through CSRF for handler integration tests
      mockIsValidOrigin.mockReturnValue(true)
    })

    test("returns 404 when handler returns no response", async () => {
      mockHandle.mockResolvedValue({
        response: undefined as unknown as Response,
      })

      const { GET } = await import("./route")

      const request = new Request("http://localhost:3000/api/rpc/test", {
        method: "GET",
      })

      const response = await GET(request)
      expect(response.status).toBe(404)
      const body = await response.text()
      expect(body).toBe("Not found")
    })

    test("passes correct prefix to handler", async () => {
      const { GET } = await import("./route")

      const request = new Request("http://localhost:3000/api/rpc/test", {
        method: "GET",
      })

      await GET(request)

      expect(mockHandle).toHaveBeenCalledWith(
        request,
        expect.objectContaining({ prefix: "/api/rpc" }),
      )
    })
  })
})
