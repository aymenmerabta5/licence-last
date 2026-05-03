import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"
import { NextRequest } from "next/server"

const getSessionCookieMock = mock<() => string | null>(() => null)

mock.module("better-auth/cookies", () => ({
  getSessionCookie: getSessionCookieMock,
}))

describe("src/proxy root-path behavior", () => {
  let importCounter = 0

  beforeEach(() => {
    getSessionCookieMock.mockReset()
    getSessionCookieMock.mockReturnValue(null)
  })

  afterAll(() => {
    mock.restore()
  })

  async function importProxy() {
    importCounter += 1
    return import(`@/proxy?behavior=${importCounter}`)
  }

  test("negotiates the locale from Accept-Language on root requests", async () => {
    const { proxy } = await importProxy()
    const request = new NextRequest("https://example.com/", {
      headers: {
        "accept-language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
    })

    const response = await proxy(request)

    expect(response.headers.get("location")).toBe("https://example.com/fr")
  })

  test("does not redirect auth pages when a stale session cookie is present", async () => {
    getSessionCookieMock.mockReturnValueOnce("stale-session")

    const { proxy } = await importProxy()
    const request = new NextRequest("https://example.com/en/login")

    const response = await proxy(request)

    expect(response?.headers.get("location") ?? null).toBeNull()
  })
})
