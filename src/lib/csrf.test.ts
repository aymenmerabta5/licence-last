import { describe, expect, test } from "bun:test"

describe("isValidOrigin", () => {
  let isValidOrigin: typeof import("./csrf").isValidOrigin
  const originalPublicUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL
  const originalTrustedOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS

  async function loadCsrfModule() {
    return import(`@/lib/csrf?test=${Math.random()}`)
  }

  // Deferred import after mock.module
  test("setup", async () => {
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL = "https://stag.example.com"
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = ""
    ;({ isValidOrigin } = await loadCsrfModule())
  })

  test("should allow GET requests without origin header", async () => {
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL = "https://stag.example.com"
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = ""
    ;({ isValidOrigin } = await loadCsrfModule())
    const req = new Request("https://stag.example.com/api/data", {
      method: "GET",
    })
    expect(isValidOrigin(req)).toBe(true)
  })

  test("should allow HEAD requests without origin header", async () => {
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL = "https://stag.example.com"
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = ""
    ;({ isValidOrigin } = await loadCsrfModule())
    const req = new Request("https://stag.example.com/api/data", {
      method: "HEAD",
    })
    expect(isValidOrigin(req)).toBe(true)
  })

  test("should reject POST requests without origin header", async () => {
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL = "https://stag.example.com"
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = ""
    ;({ isValidOrigin } = await loadCsrfModule())
    const req = new Request("https://stag.example.com/api/data", {
      method: "POST",
    })
    expect(isValidOrigin(req)).toBe(false)
  })

  test("should allow POST requests with matching origin", async () => {
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL = "https://stag.example.com"
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = ""
    ;({ isValidOrigin } = await loadCsrfModule())
    const req = new Request("https://stag.example.com/api/data", {
      method: "POST",
      headers: { origin: "https://stag.example.com" },
    })
    expect(isValidOrigin(req)).toBe(true)
  })

  test("should reject POST requests with mismatching origin", async () => {
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL = "https://stag.example.com"
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = ""
    ;({ isValidOrigin } = await loadCsrfModule())
    const req = new Request("https://stag.example.com/api/data", {
      method: "POST",
      headers: { origin: "https://evil.example.com" },
    })
    expect(isValidOrigin(req)).toBe(false)
  })

  test("should reject DELETE requests without origin header", async () => {
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL = "https://stag.example.com"
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = ""
    ;({ isValidOrigin } = await loadCsrfModule())
    const req = new Request("https://stag.example.com/api/data", {
      method: "DELETE",
    })
    expect(isValidOrigin(req)).toBe(false)
  })

  test("should reject PUT requests with mismatching origin", async () => {
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL = "https://stag.example.com"
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = ""
    ;({ isValidOrigin } = await loadCsrfModule())
    const req = new Request("https://stag.example.com/api/data", {
      method: "PUT",
      headers: { origin: "https://stag.example.com:8080" },
    })
    expect(isValidOrigin(req)).toBe(false)
  })

  test("should allow POST requests from configured trusted origins", async () => {
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL = "https://stag.example.com"
    process.env.BETTER_AUTH_TRUSTED_ORIGINS =
      "https://www.stag.example.com, https://admin.stag.example.com/path"
    ;({ isValidOrigin } = await loadCsrfModule())
    const req = new Request("https://stag.example.com/api/data", {
      method: "POST",
      headers: { origin: "https://www.stag.example.com" },
    })
    expect(isValidOrigin(req)).toBe(true)
  })

  test("should ignore malformed trusted origin entries", async () => {
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL = "https://stag.example.com"
    process.env.BETTER_AUTH_TRUSTED_ORIGINS =
      "not-a-url, https://admin.stag.example.com"
    ;({ isValidOrigin } = await loadCsrfModule())
    const req = new Request("https://stag.example.com/api/data", {
      method: "POST",
      headers: { origin: "https://admin.stag.example.com" },
    })
    expect(isValidOrigin(req)).toBe(true)
  })

  test("restore env", () => {
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL = originalPublicUrl
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = originalTrustedOrigins
  })
})
