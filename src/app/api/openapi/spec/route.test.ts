import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

const BASE_URL = "https://internex.example.com"
const generateOpenAPISpecMock = mock(async () => ({ openapi: "3.1.0" }))

mock.module("@/env", () => ({
  env: {
    NEXT_PUBLIC_BETTER_AUTH_URL: BASE_URL,
  },
}))

mock.module("@/server/openapi/generator", () => ({
  generateOpenAPISpec: generateOpenAPISpecMock,
}))

describe("src/app/api/openapi/spec/route", () => {
  const originalNodeEnv = process.env.NODE_ENV
  const setNodeEnv = (value: string) => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value,
      writable: true,
      configurable: true,
    })
  }

  beforeEach(() => {
    setNodeEnv("test")
    generateOpenAPISpecMock.mockClear()
  })

  afterAll(() => {
    setNodeEnv(originalNodeEnv ?? "test")
  })

  test("returns generated spec and CORS in non-production", async () => {
    const expectedSpec = { openapi: "3.1.0", info: { title: "Internex API" } }
    generateOpenAPISpecMock.mockResolvedValueOnce(expectedSpec)

    const { GET } = await import("@/app/api/openapi/spec/route")
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(expectedSpec)
    expect(generateOpenAPISpecMock).toHaveBeenCalledWith(BASE_URL)
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://internex.example.com",
    )
  })

  test("returns 404 in production and does not generate spec", async () => {
    setNodeEnv("production")

    const { GET } = await import("@/app/api/openapi/spec/route")
    const response = await GET()

    expect(response.status).toBe(404)
    expect(await response.text()).toBe("Not Found")
    expect(generateOpenAPISpecMock).not.toHaveBeenCalled()
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull()
  })
})
