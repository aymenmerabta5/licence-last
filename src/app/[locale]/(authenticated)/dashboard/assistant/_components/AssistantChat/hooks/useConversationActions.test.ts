import { describe, expect, test } from "bun:test"

import { resolveSelectionAfterDelete } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/hooks/useConversationActions"

describe("resolveSelectionAfterDelete", () => {
  test("keeps selection when deleting a non-active conversation", () => {
    const result = resolveSelectionAfterDelete({
      deletedConversationId: "conv-2",
      activeConversationId: "conv-1",
      selectedConversationId: "conv-1",
      conversations: [{ id: "conv-1" }, { id: "conv-2" }],
    })

    expect(result).toBeUndefined()
  })

  test("selects next conversation when deleting active selected conversation", () => {
    const result = resolveSelectionAfterDelete({
      deletedConversationId: "conv-1",
      activeConversationId: "conv-1",
      selectedConversationId: "conv-1",
      conversations: [{ id: "conv-1" }, { id: "conv-2" }],
    })

    expect(result).toBe("conv-2")
  })

  test("selects next conversation when active fallback conversation is deleted", () => {
    const result = resolveSelectionAfterDelete({
      deletedConversationId: "conv-1",
      activeConversationId: "conv-1",
      selectedConversationId: null,
      conversations: [{ id: "conv-1" }, { id: "conv-2" }],
    })

    expect(result).toBe("conv-2")
  })

  test("returns null when deleting the last conversation", () => {
    const result = resolveSelectionAfterDelete({
      deletedConversationId: "conv-1",
      activeConversationId: "conv-1",
      selectedConversationId: "conv-1",
      conversations: [{ id: "conv-1" }],
    })

    expect(result).toBeNull()
  })
})
