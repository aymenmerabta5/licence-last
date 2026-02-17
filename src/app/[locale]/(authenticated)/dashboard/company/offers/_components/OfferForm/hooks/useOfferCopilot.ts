"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"

import { orpcClient } from "@/server/orpc/client"
import { isInternshipType, isWorkMode } from "@/lib/schemas/enums"

import type { OfferCopilotIntent, CopilotResult } from "@/app/[locale]/(authenticated)/dashboard/company/offers/_components/OfferForm/types"

interface SkillTag {
  id: string
  name: string
  category: string | null
}

function resolveSkillIds(
  suggestedIds: string[] | undefined,
  suggestedNames: string[] | undefined,
  skillTags: SkillTag[],
): string[] {
  const availableById = new Set(skillTags.map((s) => s.id))
  const availableByName = new Map(
    skillTags.map((s) => [s.name.toLowerCase(), s.id] as const),
  )

  const mapped: string[] = []
  for (const id of suggestedIds ?? []) {
    if (availableById.has(id)) mapped.push(id)
  }
  for (const name of suggestedNames ?? []) {
    const id = availableByName.get(name.toLowerCase())
    if (id) mapped.push(id)
  }

  return Array.from(new Set(mapped)).slice(0, 20)
}

export function useOfferCopilot(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any,
  skillTags: SkillTag[],
) {
  const [aiPrompt, setAiPrompt] = useState("")
  const [activeIntent, setActiveIntent] = useState<OfferCopilotIntent | null>(null)
  const [result, setResult] = useState<CopilotResult | null>(null)

  function getFormContext() {
    const v = form.state.values
    return {
      title: v.title as string | undefined,
      description: v.description as string | undefined,
      internshipType: v.internshipType as string | undefined,
      workMode: (v.workMode || null) as string | null,
      wilayaCode: (v.wilayaCode || null) as number | null,
      durationWeeks: (v.durationWeeks || null) as number | null,
      maxPositions: v.maxPositions as number | undefined,
      applicationDeadlineAt: (v.applicationDeadlineAt || null) as string | null,
      expectedStartDate: (v.expectedStartDate || null) as string | null,
      expectedEndDate: (v.expectedEndDate || null) as string | null,
    }
  }

  function getSkillTagsInput() {
    return skillTags.map((s) => ({ id: s.id, name: s.name }))
  }

  function applyResultToForm(intent: OfferCopilotIntent, data: CopilotResult) {
    if (data.title) form.setFieldValue("title", data.title)
    if (data.description) form.setFieldValue("description", data.description)
    if (data.internshipType && isInternshipType(data.internshipType)) {
      form.setFieldValue("internshipType", data.internshipType)
    }
    if (data.workMode && isWorkMode(data.workMode)) {
      form.setFieldValue("workMode", data.workMode)
    }
    if (data.wilayaCode != null) form.setFieldValue("wilayaCode", data.wilayaCode)
    if (data.durationWeeks != null) form.setFieldValue("durationWeeks", data.durationWeeks)
    if (data.maxPositions != null) form.setFieldValue("maxPositions", data.maxPositions)
    if (data.applicationDeadlineAt != null) {
      form.setFieldValue("applicationDeadlineAt", data.applicationDeadlineAt)
    }
    if (data.expectedStartDate != null) {
      form.setFieldValue("expectedStartDate", data.expectedStartDate)
    }
    if (data.expectedEndDate != null) {
      form.setFieldValue("expectedEndDate", data.expectedEndDate)
    }

    if (intent === "offer_generate_draft" || intent === "offer_suggest_skill_tags") {
      const resolved = resolveSkillIds(data.skillTagIds, data.skillTagNames, skillTags)
      if (resolved.length > 0) form.setFieldValue("skillTagIds", resolved)
    }
  }

  const generateDraft = useMutation({
    mutationFn: () =>
      orpcClient.offers.generateDraft({
        ...getFormContext(),
        prompt: aiPrompt.trim() || undefined,
        availableSkillTags: getSkillTagsInput(),
      }),
    onSuccess: (data) => {
      const r: CopilotResult = {
        intent: "offer_generate_draft",
        title: data.title,
        description: data.description,
        internshipType: data.internshipType,
        workMode: data.workMode,
        wilayaCode: data.wilayaCode,
        durationWeeks: data.durationWeeks,
        maxPositions: data.maxPositions,
        applicationDeadlineAt: data.applicationDeadlineAt,
        expectedStartDate: data.expectedStartDate,
        expectedEndDate: data.expectedEndDate,
        skillTagIds: data.suggestedSkillTagIds,
        skillTagNames: data.suggestedSkillTagNames,
      }
      setResult(r)
      applyResultToForm("offer_generate_draft", r)
    },
  })

  const improveDescription = useMutation({
    mutationFn: () => orpcClient.offers.improveDescription(getFormContext()),
    onSuccess: (data) => {
      const r: CopilotResult = {
        intent: "offer_improve_description",
        description: data.description,
      }
      setResult(r)
      applyResultToForm("offer_improve_description", r)
    },
  })

  const suggestSkills = useMutation({
    mutationFn: () => {
      const ctx = getFormContext()
      return orpcClient.offers.suggestSkills({
        title: ctx.title,
        description: ctx.description,
        internshipType: ctx.internshipType,
        workMode: ctx.workMode,
        availableSkillTags: getSkillTagsInput(),
      })
    },
    onSuccess: (data) => {
      const r: CopilotResult = {
        intent: "offer_suggest_skill_tags",
        skillTagIds: data.skillTagIds,
        skillTagNames: data.skillTagNames,
      }
      setResult(r)
      applyResultToForm("offer_suggest_skill_tags", r)
    },
  })

  function sendIntent(intent: OfferCopilotIntent) {
    setActiveIntent(intent)
    setResult(null)

    switch (intent) {
      case "offer_generate_draft":
        generateDraft.mutate()
        break
      case "offer_improve_description":
        improveDescription.mutate()
        break
      case "offer_suggest_skill_tags":
        suggestSkills.mutate()
        break
    }
  }

  function applyToForm() {
    if (!result) return
    applyResultToForm(result.intent, result)
  }

  const isPending =
    generateDraft.isPending ||
    improveDescription.isPending ||
    suggestSkills.isPending

  const error =
    generateDraft.error ?? improveDescription.error ?? suggestSkills.error ?? undefined

  return {
    aiPrompt,
    setAiPrompt,
    activeIntent,
    isPending,
    error,
    result,
    sendIntent,
    applyToForm,
  }
}
