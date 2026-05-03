import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"
import { NextRequest } from "next/server"

const getSessionCookieMock = mock<() => string | null>(() => null)
const fetchMock = mock<
  (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
>(() => Promise.resolve(new Response()))

mock.module("better-auth/cookies", () => ({
  getSessionCookie: getSessionCookieMock,
}))

describe("src/proxy maintenance-mode behavior", () => {
  let importCounter = 0

  beforeEach(() => {
    getSessionCookieMock.mockReset()
    getSessionCookieMock.mockReturnValue(null)
    fetchMock.mockReset()
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch
  })

  afterAll(() => {
    mock.restore()
  })

  async function importProxy() {
    importCounter += 1
    return import(`@/proxy?maintenance=${importCounter}`)
  }

  function mockMaintenanceResponse(enabled: boolean, canBypass: boolean) {
    fetchMock.mockReturnValue(
      Promise.resolve(
        new Response(JSON.stringify({ enabled, canBypass }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    )
  }

  test("allows /login during maintenance mode", async () => {
    mockMaintenanceResponse(true, false)
    const { proxy } = await importProxy()
    const request = new NextRequest("https://example.com/en/login")

    const response = await proxy(request)

    expect(response.headers.get("x-middleware-rewrite")).toBeNull()
  })

  test("allows /verify during maintenance mode", async () => {
    mockMaintenanceResponse(true, false)
    const { proxy } = await importProxy()
    const request = new NextRequest("https://example.com/en/verify")

    const response = await proxy(request)

    expect(response.headers.get("x-middleware-rewrite")).toBeNull()
  })

  test("rewrites non-exempt pages to maintenance when enabled and user cannot bypass", async () => {
    mockMaintenanceResponse(true, false)
    const { proxy } = await importProxy()
    const request = new NextRequest("https://example.com/en/about")

    const response = await proxy(request)

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://example.com/en/maintenance",
    )
  })

  test("allows non-exempt pages when user can bypass maintenance", async () => {
    mockMaintenanceResponse(true, true)
    const { proxy } = await importProxy()
    const request = new NextRequest("https://example.com/en/about")

    const response = await proxy(request)

    expect(response.headers.get("x-middleware-rewrite")).toBeNull()
  })

  test("rewrites protected paths to maintenance even without session cookie", async () => {
    mockMaintenanceResponse(true, false)
    const { proxy } = await importProxy()
    const request = new NextRequest("https://example.com/en/dashboard")

    const response = await proxy(request)

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://example.com/en/maintenance",
    )
  })

  test("allows all pages when maintenance mode is disabled", async () => {
    mockMaintenanceResponse(false, false)
    const { proxy } = await importProxy()
    const request = new NextRequest("https://example.com/en/about")

    const response = await proxy(request)

    expect(response.headers.get("x-middleware-rewrite")).toBeNull()
  })

  test("allows /maintenance page during maintenance to avoid loop", async () => {
    mockMaintenanceResponse(true, false)
    const { proxy } = await importProxy()
    const request = new NextRequest("https://example.com/en/maintenance")

    const response = await proxy(request)

    expect(response.headers.get("x-middleware-rewrite")).toBeNull()
  })

  test("fails open when status endpoint is unreachable", async () => {
    fetchMock.mockImplementation(() =>
      Promise.reject(new Error("Network error")),
    )
    const { proxy } = await importProxy()
    const request = new NextRequest("https://example.com/en/about")

    const response = await proxy(request)

    expect(response.headers.get("x-middleware-rewrite")).toBeNull()
  })
})
