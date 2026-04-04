import { beforeEach, describe, expect, mock, test } from "bun:test"

const getArcadeToolsMock = mock(async () => ({
  gmail_send: { description: "send" },
}))
const loggerWarnMock = mock(() => {})

mock.module("@/server/ai/tools/arcade", () => ({
  getArcadeTools: getArcadeToolsMock,
}))

mock.module("@/server/logging", () => ({
  createModuleLogger: () => ({
    info: () => {},
    warn: loggerWarnMock,
    error: () => {},
  }),
  logger: {
    warn: loggerWarnMock,
  },
}))

let importCounter = 0

describe("src/server/ai/arcade-fallback", () => {
  beforeEach(() => {
    getArcadeToolsMock.mockClear()
    loggerWarnMock.mockClear()
  })

  test("returns arcade tools when discovery succeeds", async () => {
    importCounter += 1
    const mod = await import(
      `@/server/ai/arcade-fallback?test=${importCounter}`
    )

    const result = await mod.loadArcadeToolsOrFallback({
      userId: "company-user-1",
      config: { allowedToolkits: ["gmail"], limit: 1 },
    })

    expect(result).toEqual({
      gmail_send: { description: "send" },
    })
    expect(loggerWarnMock).not.toHaveBeenCalled()
  })

  test("falls back to internal-only tools when arcade discovery fails", async () => {
    getArcadeToolsMock.mockRejectedValueOnce(new Error("arcade down"))

    importCounter += 1
    const mod = await import(
      `@/server/ai/arcade-fallback?test=${importCounter}`
    )

    const result = await mod.loadArcadeToolsOrFallback({
      userId: "company-user-1",
      config: { allowedToolkits: ["gmail"], limit: 1 },
    })

    expect(result).toEqual({})
    expect(getArcadeToolsMock).toHaveBeenCalledTimes(1)
  })
})
