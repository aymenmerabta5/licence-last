"use client"

import { useMemo, useState } from "react"
import { DefaultChatTransport } from "ai"
import { useChat } from "@ai-sdk/react"
import {
  asRecord,
  findLatestToolOutput,
  getNumber,
  getString,
  getStringArray,
} from "@/lib/ai/tool-output"
import { isInternshipType, isWorkMode } from "@/lib/schemas/enums"

import type { OfferCopilotIntent } from "../types"

interface SkillTag {
  id: string
  name: string
  category: string | null
}

export function useOfferCopilot(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any,
  skillTags: SkillTag[],
) {
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiIntent, setAiIntent] = useState<OfferCopilotIntent | null>(null)

  const aiTransport = useMemo(
    () => new DefaultChatTransport({ api: "/api/assistant/chat" }),
    [],
  )

  const {
    messages: aiMessages,
    status: aiStatus,
    error: aiError,
    sendMessage: sendAiMessage,
    setMessages: setAiMessages,
  } = useChat({ transport: aiTransport })

  function sendIntent(intent: OfferCopilotIntent, text: string) {
    setAiIntent(intent)
    setAiMessages([])
    const v = form.state.values
    const baseContext = {
      intent,
      title: v.title,
      internshipType: v.internshipType,
      workMode: v.workMode || null,
      wilayaCode: v.wilayaCode || null,
      durationWeeks: v.durationWeeks || null,
      maxPositions: v.maxPositions,
      description: v.description,
    }

    const needsSkills =
      intent === "offer_generate_draft" || intent === "offer_suggest_skill_tags"
    const context = needsSkills
      ? {
          ...baseContext,
          prompt: intent === "offer_generate_draft" ? aiPrompt.trim() || undefined : undefined,
          availableSkillTags: skillTags.map((s) => ({
            id: s.id,
            name: s.name,
            category: s.category ?? null,
          })),
        }
      : baseContext

    void sendAiMessage({ text }, { body: { context } })
  }

  function applyToForm() {
    if (!aiIntent) return
    const out = findLatestToolOutput(aiMessages, aiIntent)
    const outRecord = asRecord(out)
    if (!outRecord) return

    const nextTitle = getString(outRecord.title)
    const nextDescription = getString(outRecord.description)
    const nextInternshipType = getString(outRecord.internshipType)
    const nextWorkMode = getString(outRecord.workMode)
    const nextWilayaCode = getNumber(outRecord.wilayaCode)
    const nextDurationWeeks = getNumber(outRecord.durationWeeks)
    const nextMaxPositions = getNumber(outRecord.maxPositions)

    if (nextTitle) form.setFieldValue("title", nextTitle)
    if (nextDescription) form.setFieldValue("description", nextDescription)
    if (nextInternshipType && isInternshipType(nextInternshipType)) {
      form.setFieldValue("internshipType", nextInternshipType)
    }
    if (nextWorkMode && isWorkMode(nextWorkMode)) {
      form.setFieldValue("workMode", nextWorkMode)
    }
    if (nextWilayaCode != null) form.setFieldValue("wilayaCode", nextWilayaCode)
    if (nextDurationWeeks != null)
      form.setFieldValue("durationWeeks", nextDurationWeeks)
    if (nextMaxPositions != null)
      form.setFieldValue("maxPositions", nextMaxPositions)

    const suggestedIds = getStringArray(
      outRecord.skillTagIds ?? outRecord.suggestedSkillTagIds,
    )
    const suggestedNames = getStringArray(
      outRecord.skillTagNames ?? outRecord.suggestedSkillTagNames,
    )

    if (
      aiIntent === "offer_suggest_skill_tags" ||
      aiIntent === "offer_generate_draft"
    ) {
      const availableById = new Set(skillTags.map((s) => s.id))
      const availableByName = new Map(
        skillTags.map((s) => [s.name.toLowerCase(), s.id] as const),
      )

      const mapped: string[] = []
      for (const id of suggestedIds) {
        if (availableById.has(id)) mapped.push(id)
      }
      for (const name of suggestedNames) {
        const id = availableByName.get(name.toLowerCase())
        if (id) mapped.push(id)
      }

      const deduped = Array.from(new Set(mapped)).slice(0, 20)
      if (deduped.length > 0) {
        form.setFieldValue("skillTagIds", deduped)
      }
    }
  }

  function getPreviewOutput() {
    if (!aiIntent) return null
    return findLatestToolOutput(aiMessages, aiIntent)
  }

  return {
    aiPrompt,
    setAiPrompt,
    aiIntent,
    aiStatus,
    aiError,
    aiMessages,
    sendIntent,
    applyToForm,
    getPreviewOutput,
  }
}
