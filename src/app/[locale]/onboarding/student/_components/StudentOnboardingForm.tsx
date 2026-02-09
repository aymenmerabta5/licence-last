"use client"

import { useState, useMemo } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import {
  User,
  Phone,
  Github,
  Globe,
  MapPin,
  GraduationCap,
  Hash,
  FileText,
  AlertCircle,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react"

import { useRouter } from "@/i18n/routing"
import { createStudentProfileSchema } from "@/lib/schemas/student"
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

/* ── Skill category labels ── */
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

export function StudentOnboardingForm() {
  const t = useTranslations("onboarding.student")
  const tv = useTranslations("auth.validation")
  const router = useRouter()

  const [serverError, setServerError] = useState("")

  const { data: skillTags = [] } = useQuery(
    orpc.skills.list.queryOptions(),
  )

  const schema = useMemo(
    () => createStudentProfileSchema(tv),
    [tv],
  )

  const form = useForm({
    defaultValues: {
      bio: "",
      phone: "",
      githubUrl: "",
      portfolioUrl: "",
      studentNumber: "",
      department: "",
      level: "",
      wilayaCode: 0,
      address: "",
      skillTagIds: [] as string[],
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
        await orpcClient.students.upsertProfile({
          bio: value.bio || undefined,
          phone: value.phone || undefined,
          githubUrl: value.githubUrl || undefined,
          portfolioUrl: value.portfolioUrl || undefined,
          studentNumber: value.studentNumber || undefined,
          department: value.department || undefined,
          level: value.level || undefined,
          wilayaCode: value.wilayaCode || undefined,
          address: value.address || undefined,
          skillTagIds: value.skillTagIds,
        })

        router.push("/dashboard")
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : t("error"),
        )
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
        <h1 className="font-serif text-3xl text-heading tracking-tight mb-2 transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground font-light transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {t("subtitle")}
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

      {/* ── Personal Info ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.1 }}
        className="space-y-5"
      >
        <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground border-b border-border pb-2">
          {t("personalSection")}
        </h2>

        {/* Bio */}
        <form.Field name="bio">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="student-bio"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("bio")}
              </Label>
              <div className="relative">
                <FileText className="absolute start-3 top-3 h-4 w-4 text-muted-foreground/60" />
                <textarea
                  id="student-bio"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("bioPlaceholder")}
                  rows={3}
                  className="w-full rounded-none border border-input bg-transparent ps-10 pe-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
                />
              </div>
            </div>
          )}
        </form.Field>

        {/* Phone */}
        <form.Field name="phone">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="student-phone"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("phone")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <Phone className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="student-phone"
                  type="tel"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("phonePlaceholder")}
                />
              </InputGroup>
            </div>
          )}
        </form.Field>

        {/* Student Number */}
        <form.Field name="studentNumber">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="student-number"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("studentNumber")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <Hash className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="student-number"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("studentNumberPlaceholder")}
                />
              </InputGroup>
            </div>
          )}
        </form.Field>

        {/* Department */}
        <form.Field name="department">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="student-department"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("department")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <GraduationCap className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="student-department"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("departmentPlaceholder")}
                />
              </InputGroup>
            </div>
          )}
        </form.Field>

        {/* Level */}
        <form.Field name="level">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="student-level"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("level")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <User className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="student-level"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("levelPlaceholder")}
                />
              </InputGroup>
            </div>
          )}
        </form.Field>
      </motion.div>

      {/* ── Location ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.15 }}
        className="space-y-5"
      >
        <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground border-b border-border pb-2">
          {t("locationSection")}
        </h2>

        {/* Wilaya */}
        <form.Field name="wilayaCode">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="student-wilaya"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("wilaya")}
              </Label>
              <div className="relative">
                <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                <select
                  id="student-wilaya"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  onBlur={field.handleBlur}
                  className="w-full h-11 rounded-none border border-input bg-transparent ps-10 pe-3 text-sm appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value={0} disabled>
                    {t("wilayaPlaceholder")}
                  </option>
                  {WILAYAS.map((name, i) => (
                    <option key={i + 1} value={i + 1}>
                      {String(i + 1).padStart(2, "0")} — {name}
                    </option>
                  ))}
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

        {/* Address */}
        <form.Field name="address">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="student-address"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("address")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <MapPin className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="student-address"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("addressPlaceholder")}
                />
              </InputGroup>
            </div>
          )}
        </form.Field>
      </motion.div>

      {/* ── Links ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.2 }}
        className="space-y-5"
      >
        <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground border-b border-border pb-2">
          {t("linksSection")}
        </h2>

        {/* GitHub URL */}
        <form.Field name="githubUrl">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="student-github"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("githubUrl")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <Github className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="student-github"
                  type="url"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("githubUrlPlaceholder")}
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

        {/* Portfolio URL */}
        <form.Field name="portfolioUrl">
          {(field) => (
            <div className="space-y-2">
              <Label
                htmlFor="student-portfolio"
                className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground"
              >
                {t("portfolioUrl")}
              </Label>
              <InputGroup className="rounded-none h-11">
                <InputGroupAddon align="inline-start">
                  <Globe className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="student-portfolio"
                  type="url"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder={t("portfolioUrlPlaceholder")}
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
      </motion.div>

      {/* ── Skills ── */}
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease, delay: 0.25 }}
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
                        const isAtMax = field.state.value.length >= 10

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
                {field.state.value.length}/10 {t("skillsSelected")}
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
        transition={{ duration: 0.6, ease, delay: 0.3 }}
      >
        <form.Subscribe
          selector={(state) => [state.isSubmitting] as const}
        >
          {([isSubmitting]) => (
            <Button
              type="submit"
              variant="editorial"
              size="editorial"
              className="w-full h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {t("submit")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </motion.div>
    </form>
  )
}
