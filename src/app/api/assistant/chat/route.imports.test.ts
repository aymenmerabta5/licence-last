import { describe, expect, mock, test } from "bun:test"

let importCounter = 0
let chatHandlerModuleLoads = 0

mock.module("@/lib/csrf", () => ({
  isValidOrigin: () => true,
}))

mock.module("@/server/ai/chat-handler", () => {
  chatHandlerModuleLoads += 1

  return {
    handleChatRequest: mock(async () => new Response("ok")),
  }
})

async function loadModule() {
  importCounter += 1
  return import(`@/app/api/assistant/chat/route?imports-test=${importCounter}`)
}

describe("src/app/api/assistant/chat/route imports", () => {
  test("does not load the AI chat handler during import", async () => {
    await loadModule()

    expect(chatHandlerModuleLoads).toBe(0)
  })
})
