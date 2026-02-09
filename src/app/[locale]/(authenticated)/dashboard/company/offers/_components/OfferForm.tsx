"use client"

import { useState, useMemo } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import {
  FileText,
  Briefcase,
  MapPin,
  Clock,
  Users,
  AlertCircle,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react"

import { useRouter } from "@/i18n/routing"
import { createOfferSchema } from "@/lib/schemas/offer"
import { errorMessage } from "@/lib/schemas/auth"
import { orpcClient, orpc } from "@/server/orpc/client"
import { WILAYAS } from "@/lib/wilayas"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

const CATEGORY_ORDER = [
  "frontend",
  "backend",
  "languages",
  "database",
  "devops",
  "mobile",
  "data_ai",
  "other",
] as const

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  languages: "Languages",
  database: "Database",
  devops: "DevOps",
  mobile: "Mobile",
  data_ai: "Data & AI",
  other: "Other",
}

interface OfferFormProps {
  mode: "create" | "edit"
  initialData?: {
    offerId: string
    title: string
    description: string
    internshipType: string
    workMode: string | null
    wilayaCode: number | null
    durationWeeks: number | null
    maxPositions: number
    skillTagIds: string[]
  }
}

export function OfferForm({ mode, initialData }: OfferFormProps) {
  const t = useTranslations("dashboard.company.offers.form")
  const tv = useTranslations("auth.validation")
  const router = useRouter()

  const [serverError, setServerError] = useState("")

  const { data: skillTags = [] } = useQuery(orpc.skills.list.queryOptions())

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
      onSubmit: ({ value }) => {
        const result = schema.safeParse(value)
        const fieldErrors: Record<string, string> = {}

        if (!result.success) {
          for (const issue of result.error.issues) {
            const path = issue.path[0]
            if (path !== undefined && !fieldErrors[String(path)]) {
              fieldErrors[String(path)] = issue.message
            }
          }
        }

        return Object.keys(fieldErrors).length > 0
          ? { fields: fieldErrors }
          : undefined
      },
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
  const groupedSkills = useMemo(() => {
    const groups: Record<string, typeof skillTags> = {}
    for (const skill of skillTags) {
      const cat = skill.category || "other"
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(skill)
    }
    return groups
  }, [skillTags])

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

      {/* ── Server Error ── */}
      {serverError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-start gap-2.5 p-3.5 text-sm text-destructive bg-destructive/5 border border-destructive/15"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </motion.div>
      )}

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
                      {CATEGORY_LABELS[category] ?? category}
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
