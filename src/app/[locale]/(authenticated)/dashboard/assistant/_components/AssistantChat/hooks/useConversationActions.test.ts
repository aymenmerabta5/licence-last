import { describe, expect, test } from "bun:test"

import {
  applyOptimisticConversationModelUpdate,
  resolveSelectionAfterDelete,
  shouldSkipConversationModelUpdate,
} from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/hooks/useConversationActions"

const FIXTURE_UPDATED_AT = new Date("2026-03-28T10:00:00.000Z")

describe("applyOptimisticConversationModelUpdate", () => {
  test("updates the conversation model and timestamp", () => {
    const updatedAt = new Date("2026-03-28T10:00:00.000Z")

    const result = applyOptimisticConversationModelUpdate(
      {
        id: "conv-1",
        model: "gpt-5.3",
        updatedAt: new Date("2026-03-27T10:00:00.000Z"),
      },
      "gpt-5.4",
      updatedAt,
    )

    expect(result).toEqual({
      id: "conv-1",
      model: "gpt-5.4",
      updatedAt,
    })
  })
})

describe("resolveSelectionAfterDelete", () => {
  test("keeps selection when deleting a non-active conversation", () => {
    const result = resolveSelectionAfterDelete({
      deletedConversationId: "conv-2",
      activeConversationId: "conv-1",
      selectedConversationId: "conv-1",
      conversations: [
        { id: "conv-1", model: "gpt-5.4", updatedAt: FIXTURE_UPDATED_AT },
        { id: "conv-2", model: "gpt-5.4", updatedAt: FIXTURE_UPDATED_AT },
      ],
    })

    expect(result).toBeUndefined()
  })

  test("selects next conversation when deleting active selected conversation", () => {
    const result = resolveSelectionAfterDelete({
      deletedConversationId: "conv-1",
      activeConversationId: "conv-1",
      selectedConversationId: "conv-1",
      conversations: [
        { id: "conv-1", model: "gpt-5.4", updatedAt: FIXTURE_UPDATED_AT },
        { id: "conv-2", model: "gpt-5.4", updatedAt: FIXTURE_UPDATED_AT },
      ],
    })

    expect(result).toBe("conv-2")
  })

  test("selects next conversation when active fallback conversation is deleted", () => {
    const result = resolveSelectionAfterDelete({
      deletedConversationId: "conv-1",
      activeConversationId: "conv-1",
      selectedConversationId: null,
      conversations: [
        { id: "conv-1", model: "gpt-5.4", updatedAt: FIXTURE_UPDATED_AT },
        { id: "conv-2", model: "gpt-5.4", updatedAt: FIXTURE_UPDATED_AT },
      ],
    })

    expect(result).toBe("conv-2")
  })

  test("returns null when deleting the last conversation", () => {
    const result = resolveSelectionAfterDelete({
      deletedConversationId: "conv-1",
      activeConversationId: "conv-1",
      selectedConversationId: "conv-1",
      conversations: [
        { id: "conv-1", model: "gpt-5.4", updatedAt: FIXTURE_UPDATED_AT },
      ],
    })

    expect(result).toBeNull()
  })
})

describe("shouldSkipConversationModelUpdate", () => {
  test("returns true when selecting the current model", () => {
    expect(
      shouldSkipConversationModelUpdate("gpt-5.4", "gpt-5.4"),
    ).toBeTrue()
  })

  test("returns true when no next model is provided", () => {
    expect(shouldSkipConversationModelUpdate("gpt-5.4", null)).toBeTrue()
  })

  test("returns false when selecting a different model", () => {
    expect(
      shouldSkipConversationModelUpdate("gpt-5.4", "gpt-5.3"),
    ).toBeFalse()
  })
})
