import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"
import { NextRequest } from "next/server"

const getSessionCookieMock = mock<() => string | null>(() => null)
const checkMaintenanceStatusMock = mock<
  () => Promise<{ enabled: boolean; canBypass: boolean }>
>(() => Promise.resolve({ enabled: false, canBypass: false }))

mock.module("better-auth/cookies", () => ({
  getSessionCookie: getSessionCookieMock,
}))

mock.module("@/lib/proxy-maintenance", () => ({
  checkMaintenanceStatus: checkMaintenanceStatusMock,
}))

describe("src/proxy maintenance-mode behavior", () => {
  let importCounter = 0

  beforeEach(() => {
    getSessionCookieMock.mockReset()
    getSessionCookieMock.mockReturnValue(null)
    checkMaintenanceStatusMock.mockReset()
    checkMaintenanceStatusMock.mockReturnValue(
      Promise.resolve({ enabled: false, canBypass: false }),
    )
  })

  afterAll(() => {
    mock.restore()
  })

  async function importProxy() {
    importCounter += 1
    return import(`@/proxy?maintenance=${importCounter}`)
  }

  function mockMaintenanceResponse(enabled: boolean, canBypass: boolean) {
    checkMaintenanceStatusMock.mockReturnValue(
      Promise.resolve({ enabled, canBypass }),
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

  test("fails open when status check throws an error", async () => {
    checkMaintenanceStatusMock.mockImplementation(() =>
      Promise.reject(new Error("Database unreachable")),
    )
    const { proxy } = await importProxy()
    const request = new NextRequest("https://example.com/en/about")

    const response = await proxy(request)

    expect(response.headers.get("x-middleware-rewrite")).toBeNull()
  })
})
