"use client"

import { useState, useMemo } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { DefaultChatTransport } from "ai"
import { useChat } from "@ai-sdk/react"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import {
  FileText,
  Briefcase,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Loader2,
  Check,
  Sparkles,
  Wand2,
  Tag,
} from "lucide-react"

import { useRouter } from "@/i18n/routing"
import {
  asRecord,
  findLatestToolOutput,
  getNumber,
  getString,
  getStringArray,
} from "@/lib/ai/tool-output"
import { createOfferSchema } from "@/lib/schemas/offer"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { reveal, ease } from "@/lib/animations"
import { isInternshipType, isWorkMode } from "@/lib/schemas/enums"
import { errorMessage } from "@/lib/schemas/auth"
import { orpcClient, orpc } from "@/server/orpc/client"
import { WILAYAS } from "@/lib/wilayas"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ServerError } from "@/components/ServerError"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

import type { OfferCopilotIntent, OfferFormProps } from "./types"
import { groupSkillsByCategory, CATEGORY_ORDER } from "./utils"

export function OfferForm({ mode, initialData }: OfferFormProps) {
  const t = useTranslations("dashboard.company.offers.form")
  const tv = useTranslations("auth.validation")
  const router = useRouter()

  const [serverError, setServerError] = useState("")

  const [aiPrompt, setAiPrompt] = useState("")
  const [aiIntent, setAiIntent] = useState<OfferCopilotIntent | null>(null)

  const { data: skillTagsResult } = useQuery(orpc.skills.list.queryOptions())
  const skillTags = useMemo(
    () => skillTagsResult?.skills ?? [],
    [skillTagsResult?.skills],
  )

  const aiTransport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant/chat",
      }),
    [],
  )

  const {
    messages: aiMessages,
    status: aiStatus,
    error: aiError,
    sendMessage: sendAiMessage,
    setMessages: setAiMessages,
  } = useChat({
    transport: aiTransport,
  })

  const schema = useMemo(() => createOfferSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      internshipType: (initialData?.internshipType ?? "") as "" | "pfe" | "immersion" | "summer" | "practical",
      workMode: (initialData?.workMode ?? "") as "" | "on_site" | "hybrid" | "remote",
      wilayaCode: initialData?.wilayaCode ?? 0,
      durationWeeks: initialData?.durationWeeks ?? 0,
      maxPositions: initialData?.maxPositions ?? 1,
      skillTagIds: initialData?.skillTagIds ?? ([] as string[]),
    },
    validators: {
      onSubmit: ({ value }) => mapZodErrors(schema.safeParse(value)),
    },
    onSubmit: async ({ value }) => {
      setServerError("")

      try {
        if (mode === "create") {
          await orpcClient.offers.create({
            title: value.title,
            description: value.description,
            internshipType: value.internshipType as "pfe" | "immersion" | "summer" | "practical",
            workMode: value.workMode ? (value.workMode as "on_site" | "hybrid" | "remote") : undefined,
            wilayaCode: value.wilayaCode || undefined,
            durationWeeks: value.durationWeeks || undefined,
            maxPositions: value.maxPositions || undefined,
            skillTagIds: value.skillTagIds,
          })
        } else {
          await orpcClient.offers.update({
            offerId: initialData!.offerId,
            title: value.title,
            description: value.description,
            internshipType: value.internshipType as "pfe" | "immersion" | "summer" | "practical",
            workMode: value.workMode ? (value.workMode as "on_site" | "hybrid" | "remote") : null,
            wilayaCode: value.wilayaCode || null,
            durationWeeks: value.durationWeeks || null,
            maxPositions: value.maxPositions || undefined,
            skillTagIds: value.skillTagIds,
          })
        }

        router.push("/dashboard/company/offers" as "/dashboard")
      } catch (err) {
        setServerError(err instanceof Error ? err.message : t("error"))
      }
    },
  })

  // Group skills by category
  const groupedSkills = useMemo(() => groupSkillsByCategory(skillTags), [skillTags])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-7"
    >
      {/* ── Header ── */}
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <h1 className="font-serif text-3xl text-heading tracking-tight mb-2">
          {mode === "create" ? t("createTitle") : t("editTitle")}
        </h1>
        <p className="text-sm text-muted-foreground font-light">
          {mode === "create" ? t("createSubtitle") : t("editSubtitle")}
        </p>
      </motion.div>

      <ServerError message={serverError} />

      {/* ── AI Copilot ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.08 }}
        className="border border-border bg-primary/5 p-4 sm:p-5 rounded-none space-y-4"
       >
         <div className="flex items-start justify-between gap-3">
           <div className="space-y-1">
             <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/70">
              {t("copilot.title")}
              </p>
              <p className="text-sm text-muted-foreground font-light">
              {t("copilot.description")}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs tracking-wide">{t("copilot.badge")}</span>
            </div>
          </div>

        <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
          <div className="space-y-2">
            <Label
              htmlFor="offer-ai-prompt"
              className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
            >
              {t("copilot.promptLabel")}
            </Label>
            <InputGroup className="rounded-none h-11">
              <InputGroupAddon align="inline-start">
                <Wand2 className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="offer-ai-prompt"
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={t("copilot.promptPlaceholder")}
              />
            </InputGroup>
          </div>

          <Button
            type="button"
            variant="editorial"
            size="editorial"
            className="h-11 mt-[26px]"
            disabled={aiStatus !== "ready"}
            onClick={() => {
              setAiIntent("offer_generate_draft")
              setAiMessages([])
              const v = form.state.values
              const context = {
                intent: "offer_generate_draft",
                prompt: aiPrompt.trim() || undefined,
                title: v.title,
                internshipType: v.internshipType,
                workMode: v.workMode || null,
                wilayaCode: v.wilayaCode || null,
                durationWeeks: v.durationWeeks || null,
                maxPositions: v.maxPositions,
                description: v.description,
                availableSkillTags: skillTags.map((s) => ({
                  id: s.id,
                  name: s.name,
                  category: s.category ?? null,
                })),
              }
              void sendAiMessage(
                { text: aiPrompt.trim() || t("copilot.prompts.generateDraft") },
                { body: { context } },
              )
            }}
          >
            {t("copilot.generateDraft")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={aiStatus !== "ready"}
            onClick={() => {
              setAiIntent("offer_improve_description")
              setAiMessages([])
              const v = form.state.values
              const context = {
                intent: "offer_improve_description",
                title: v.title,
                internshipType: v.internshipType,
                workMode: v.workMode || null,
                wilayaCode: v.wilayaCode || null,
                durationWeeks: v.durationWeeks || null,
                maxPositions: v.maxPositions,
                description: v.description,
              }
              void sendAiMessage(
                { text: t("copilot.prompts.improveDescription") },
                { body: { context } },
              )
            }}
          >
            {t("copilot.improveDescription")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={aiStatus !== "ready"}
            onClick={() => {
              setAiIntent("offer_suggest_skill_tags")
              setAiMessages([])
              const v = form.state.values
              const context = {
                intent: "offer_suggest_skill_tags",
                title: v.title,
                internshipType: v.internshipType,
                workMode: v.workMode || null,
                wilayaCode: v.wilayaCode || null,
                durationWeeks: v.durationWeeks || null,
                maxPositions: v.maxPositions,
                description: v.description,
                availableSkillTags: skillTags.map((s) => ({
                  id: s.id,
                  name: s.name,
                  category: s.category ?? null,
                })),
              }
              void sendAiMessage(
                { text: t("copilot.prompts.suggestSkills") },
                { body: { context } },
              )
            }}
          >
            <Tag className="h-4 w-4" />
            {t("copilot.suggestSkills")}
          </Button>
          <p className="text-[11px] text-muted-foreground self-center">
            {t("copilot.status", { status: aiStatus })}
          </p>
        </div>

        {aiError && <p className="text-[11px] text-destructive">{aiError.message}</p>}

        {aiIntent && (
          <div className="border border-border bg-background/60 p-4 rounded-none space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/70">
                {t("copilot.preview")}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={aiStatus !== "ready"}
                onClick={() => {
                  const out = findLatestToolOutput(aiMessages, aiIntent)
                  const outRecord = asRecord(out)
                  if (!outRecord) return

                  // Apply title/description/fields if present
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
                  if (nextDurationWeeks != null) form.setFieldValue("durationWeeks", nextDurationWeeks)
                  if (nextMaxPositions != null) form.setFieldValue("maxPositions", nextMaxPositions)

                  const suggestedIds = getStringArray(outRecord.skillTagIds ?? outRecord.suggestedSkillTagIds)
                  const suggestedNames = getStringArray(outRecord.skillTagNames ?? outRecord.suggestedSkillTagNames)

                  if (aiIntent === "offer_suggest_skill_tags" || aiIntent === "offer_generate_draft") {
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
                }}
              >
                {t("copilot.applyToForm")}
              </Button>
            </div>

            {(() => {
              const out = findLatestToolOutput(aiMessages, aiIntent)
                if (!out) {
                  return <p className="text-xs text-muted-foreground">{t("copilot.waiting")}</p>
                }

              return (
                <pre className="text-xs rounded-md border border-border/60 bg-muted/20 p-3 overflow-x-auto">
                  {JSON.stringify(out, null, 2)}
                </pre>
              )
            })()}
          </div>
        )}
      </motion.div>

      {/* ── Basic Info ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="space-y-5"
      >
        <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground border-b border-border pb-2">
          {t("basicInfo")}
        </h2>

        {/* Title */}
        <form.Field name="title">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="offer-title"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("title")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <Briefcase className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="offer-title"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("titlePlaceholder")}
                />
              </InputGroup>
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-[11px] tracking-wide" role="alert">
                  {errorMessage(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Description */}
        <form.Field name="description">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="offer-description"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("description")}
              </Label>
              <div className="relative">
                <FileText className="absolute start-3 top-3 h-4 w-4 text-muted-foreground/60" />
                <textarea
                  id="offer-description"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("descriptionPlaceholder")}
                  rows={5}
                  className="w-full rounded-none border border-input bg-transparent ps-10 pe-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
                />
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-[11px] tracking-wide" role="alert">
                  {errorMessage(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </motion.div>

      {/* ── Details ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.15 }}
        className="space-y-5"
      >
        <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground border-b border-border pb-2">
          {t("details")}
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Internship Type */}
          <form.Field name="internshipType">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor="offer-type"
                  className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
                >
                  {t("internshipType")}
                </Label>
                <div className="relative">
                  <Briefcase className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                  <select
                    id="offer-type"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value as "pfe" | "immersion" | "summer" | "practical")}
                    onBlur={field.handleBlur}
                    className="w-full h-11 rounded-none border border-input bg-transparent ps-10 pe-3 text-sm appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <option value="" disabled>
                      {t("internshipTypePlaceholder")}
                    </option>
                    <option value="pfe">PFE</option>
                    <option value="immersion">Immersion</option>
                    <option value="summer">Summer</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-destructive text-[11px] tracking-wide" role="alert">
                    {errorMessage(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Work Mode */}
          <form.Field name="workMode">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor="offer-work-mode"
                  className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
                >
                  {t("workMode")}
                </Label>
                <div className="relative">
                  <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                  <select
                    id="offer-work-mode"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value as "on_site" | "hybrid" | "remote")}
                    onBlur={field.handleBlur}
                    className="w-full h-11 rounded-none border border-input bg-transparent ps-10 pe-3 text-sm appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <option value="">
                      {t("workModePlaceholder")}
                    </option>
                    <option value="on_site">On-site</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>
            )}
          </form.Field>

          {/* Wilaya */}
          <form.Field name="wilayaCode">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor="offer-wilaya"
                  className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
                >
                  {t("wilaya")}
                </Label>
                <div className="relative">
                  <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                  <select
                    id="offer-wilaya"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                    className="w-full h-11 rounded-none border border-input bg-transparent ps-10 pe-3 text-sm appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <option value={0}>
                      {t("wilayaPlaceholder")}
                    </option>
                    {WILAYAS.map((name, i) => (
                      <option key={i + 1} value={i + 1}>
                        {String(i + 1).padStart(2, "0")} — {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </form.Field>

          {/* Duration Weeks */}
          <form.Field name="durationWeeks">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor="offer-duration"
                  className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
                >
                  {t("durationWeeks")}
                </Label>
                <InputGroup className="rounded-none h-11">
                  <InputGroupAddon align="inline-start">
                    <Clock className="h-4 w-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="offer-duration"
                    type="number"
                    min={0}
                    max={52}
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                    placeholder={t("durationWeeksPlaceholder")}
                  />
                </InputGroup>
              </div>
            )}
          </form.Field>

          {/* Max Positions */}
          <form.Field name="maxPositions">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor="offer-positions"
                  className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
                >
                  {t("maxPositions")}
                </Label>
                <InputGroup className="rounded-none h-11">
                  <InputGroupAddon align="inline-start">
                    <Users className="h-4 w-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="offer-positions"
                    type="number"
                    min={1}
                    max={100}
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                    placeholder={t("maxPositionsPlaceholder")}
                  />
                </InputGroup>
              </div>
            )}
          </form.Field>
        </div>
      </motion.div>

      {/* ── Skills ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.2 }}
        className="space-y-5"
      >
        <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground border-b border-border pb-2">
          {t("skillsSection")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("skillsHint")}
        </p>

        <form.Field name="skillTagIds">
          {(field) => (
            <div className="space-y-4">
              {CATEGORY_ORDER.map((category) => {
                const skills = groupedSkills[category]
                if (!skills || skills.length === 0) return null

                return (
                  <div key={category} className="space-y-2">
                    <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/70">
                      {t(`skillCategory.${category}` as "skillCategory.frontend")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => {
                        const isSelected = field.state.value.includes(skill.id)
                        const isAtMax = field.state.value.length >= 20

                        return (
                          <button
                            key={skill.id}
                            type="button"
                            disabled={!isSelected && isAtMax}
                            onClick={() => {
                              if (isSelected) {
                                field.handleChange(
                                  field.state.value.filter((id) => id !== skill.id),
                                )
                              } else {
                                field.handleChange([...field.state.value, skill.id])
                              }
                            }}
                            className={`
                              inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors
                              ${
                                isSelected
                                  ? "bg-primary/10 border-primary/30 text-primary font-medium"
                                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                              }
                              ${!isSelected && isAtMax ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                            `}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                            {skill.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              <p className="text-[11px] text-muted-foreground">
                {field.state.value.length}/20 {t("skillsSelected")}
              </p>

              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-[11px] tracking-wide" role="alert">
                  {errorMessage(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </motion.div>

      {/* ── Submit ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.25 }}
        className="flex items-center gap-3"
      >
        <form.Subscribe
          selector={(state) => [state.isSubmitting] as const}
        >
          {([isSubmitting]) => (
            <Button
              type="submit"
              variant="editorial"
              size="editorial"
              className="flex-1 h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === "create" ? t("submit") : t("submitEdit")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
        <Button
          type="button"
          variant="outline"
          className="h-12"
          onClick={() => router.push("/dashboard/company/offers" as "/dashboard")}
        >
          {t("cancel")}
        </Button>
      </motion.div>
    </form>
  )
}
