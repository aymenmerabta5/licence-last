"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Briefcase, MapPin, Clock, Users, Calendar } from "lucide-react"

import { errorMessage } from "@/lib/schemas/auth"
import { WILAYAS } from "@/lib/wilayas"
import { SelectField, TextField, FormSection } from "@/components/form-fields"

interface DetailsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

export function DetailsSection({ form }: DetailsSectionProps) {
  const t = useTranslations("dashboard.company.offers.form")
  const today = new Date().toISOString().split("T")[0]

  const internshipTypeOptions = useMemo(
    () => [
      { value: "pfe", label: "PFE" },
      { value: "immersion", label: "Immersion" },
      { value: "summer", label: "Summer" },
      { value: "practical", label: "Practical" },
    ],
    [],
  )

  const workModeOptions = useMemo(
    () => [
      { value: "on_site", label: "On-site" },
      { value: "hybrid", label: "Hybrid" },
      { value: "remote", label: "Remote" },
    ],
    [],
  )

  const wilayaOptions = useMemo(
    () =>
      WILAYAS.map((name, i) => ({
        value: i + 1,
        label: `${String(i + 1).padStart(2, "0")} - ${name}`,
      })),
    [],
  )

  return (
    <FormSection title={t("details")} delay={0.15}>
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Internship Type */}
        <form.Field name="internshipType">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
            <SelectField
              id="offer-type"
              label={t("internshipType")}
              icon={Briefcase}
              placeholder={t("internshipTypePlaceholder")}
              options={internshipTypeOptions}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={
                field.state.meta.errors.length > 0
                  ? errorMessage(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        {/* Work Mode */}
        <form.Field name="workMode">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
            <SelectField
              id="offer-work-mode"
              label={t("workMode")}
              icon={MapPin}
              placeholder={t("workModePlaceholder")}
              options={workModeOptions}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>

        {/* Wilaya */}
        <form.Field name="wilayaCode">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
            <SelectField
              id="offer-wilaya"
              label={t("wilaya")}
              icon={MapPin}
              placeholder={t("wilayaPlaceholder")}
              options={wilayaOptions}
              value={field.state.value}
              onChange={(v) => field.handleChange(Number(v))}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>

        {/* Duration Weeks */}
        <form.Field name="durationWeeks">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
            <TextField
              id="offer-duration"
              label={t("durationWeeks")}
              icon={Clock}
              type="number"
              value={String(field.state.value || "")}
              onChange={(v) => field.handleChange(Number(v))}
              onBlur={field.handleBlur}
              placeholder={t("durationWeeksPlaceholder")}
              error={
                field.state.meta.errors.length > 0
                  ? errorMessage(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        {/* Max Positions */}
        <form.Field name="maxPositions">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
            <TextField
              id="offer-positions"
              label={t("maxPositions")}
              icon={Users}
              type="number"
              value={String(field.state.value || "")}
              onChange={(v) => field.handleChange(Number(v))}
              onBlur={field.handleBlur}
              placeholder={t("maxPositionsPlaceholder")}
              error={
                field.state.meta.errors.length > 0
                  ? errorMessage(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        {/* Application Deadline */}
        <form.Field name="applicationDeadlineAt">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
            <TextField
              id="offer-application-deadline"
              label={t("applicationDeadline")}
              icon={Calendar}
              type="date"
              value={field.state.value || ""}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              min={today}
              max={form.state.values.expectedStartDate || undefined}
              error={
                field.state.meta.errors.length > 0
                  ? errorMessage(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        {/* Expected Start Date */}
        <form.Field name="expectedStartDate">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
            <TextField
              id="offer-expected-start-date"
              label={t("expectedStartDate")}
              icon={Calendar}
              type="date"
              value={field.state.value || ""}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              min={today}
              error={
                field.state.meta.errors.length > 0
                  ? errorMessage(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        {/* Expected End Date */}
        <form.Field name="expectedEndDate">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
            <TextField
              id="offer-expected-end-date"
              label={t("expectedEndDate")}
              icon={Calendar}
              type="date"
              value={field.state.value || ""}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              min={form.state.values.expectedStartDate || today}
              error={
                field.state.meta.errors.length > 0
                  ? errorMessage(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>
      </div>
    </FormSection>
  )
}
