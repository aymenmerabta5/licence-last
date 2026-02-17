import { describe, test, expect, mock } from "bun:test"

mock.module("@/env", () => ({
  env: {
    NEXT_PUBLIC_BETTER_AUTH_URL: "https://internex.example.com",
  },
}))

describe("isValidOrigin", () => {
  let isValidOrigin: typeof import("./csrf").isValidOrigin

  // Deferred import after mock.module
  test("setup", async () => {
    ;({ isValidOrigin } = await import("@/lib/csrf"))
  })

  test("should allow GET requests without origin header", async () => {
    ;({ isValidOrigin } = await import("@/lib/csrf"))
    const req = new Request("https://internex.example.com/api/data", {
      method: "GET",
    })
    expect(isValidOrigin(req)).toBe(true)
  })

  test("should allow HEAD requests without origin header", async () => {
    ;({ isValidOrigin } = await import("@/lib/csrf"))
    const req = new Request("https://internex.example.com/api/data", {
      method: "HEAD",
    })
    expect(isValidOrigin(req)).toBe(true)
  })

  test("should reject POST requests without origin header", async () => {
    ;({ isValidOrigin } = await import("@/lib/csrf"))
    const req = new Request("https://internex.example.com/api/data", {
      method: "POST",
    })
    expect(isValidOrigin(req)).toBe(false)
  })

  test("should allow POST requests with matching origin", async () => {
    ;({ isValidOrigin } = await import("@/lib/csrf"))
    const req = new Request("https://internex.example.com/api/data", {
      method: "POST",
      headers: { origin: "https://internex.example.com" },
    })
    expect(isValidOrigin(req)).toBe(true)
  })

  test("should reject POST requests with mismatching origin", async () => {
    ;({ isValidOrigin } = await import("@/lib/csrf"))
    const req = new Request("https://internex.example.com/api/data", {
      method: "POST",
      headers: { origin: "https://evil.example.com" },
    })
    expect(isValidOrigin(req)).toBe(false)
  })

  test("should reject DELETE requests without origin header", async () => {
    ;({ isValidOrigin } = await import("@/lib/csrf"))
    const req = new Request("https://internex.example.com/api/data", {
      method: "DELETE",
    })
    expect(isValidOrigin(req)).toBe(false)
  })

  test("should reject PUT requests with mismatching origin", async () => {
    ;({ isValidOrigin } = await import("@/lib/csrf"))
    const req = new Request("https://internex.example.com/api/data", {
      method: "PUT",
      headers: { origin: "https://internex.example.com:8080" },
    })
    expect(isValidOrigin(req)).toBe(false)
  })
})
