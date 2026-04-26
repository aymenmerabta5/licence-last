import { beforeEach, describe, expect, mock, test } from "bun:test"

const getSessionMock = mock(async () => null)

mock.module("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: getSessionMock,
    },
  },
}))

let importCounter = 0

async function loadFreshSessionModule() {
  importCounter += 1
  return import(`@/server/auth/get-fresh-session?test=${importCounter}`)
}

describe("src/server/auth/get-fresh-session", () => {
  beforeEach(() => {
    getSessionMock.mockClear()
  })

  test("disables Better Auth cookie cache for authorization checks", async () => {
    const { getFreshAuthSession } = await loadFreshSessionModule()
    const requestHeaders = new Headers({ cookie: "session=value" })

    await getFreshAuthSession(requestHeaders)

    expect(getSessionMock).toHaveBeenCalledWith({
      headers: requestHeaders,
      query: {
        disableCookieCache: true,
      },
    })
  })
})
