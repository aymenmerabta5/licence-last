"use client"

import { useTranslations } from "next-intl"
import { Briefcase, MapPin, Clock, Users } from "lucide-react"
import * as motion from "motion/react-client"
import { reveal, ease } from "@/lib/animations"
import { Label } from "@/components/ui/label"
import { errorMessage } from "@/lib/schemas/auth"
import { WILAYAS } from "@/lib/wilayas"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

interface DetailsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

export function DetailsSection({ form }: DetailsSectionProps) {
  const t = useTranslations("dashboard.company.offers.form")

  return (
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
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
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
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value as
                        | "pfe"
                        | "immersion"
                        | "summer"
                        | "practical",
                    )
                  }
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
                <p
                  className="text-destructive text-[11px] tracking-wide"
                  role="alert"
                >
                  {errorMessage(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Work Mode */}
        <form.Field name="workMode">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
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
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value as "on_site" | "hybrid" | "remote",
                    )
                  }
                  onBlur={field.handleBlur}
                  className="w-full h-11 rounded-none border border-input bg-transparent ps-10 pe-3 text-sm appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="">{t("workModePlaceholder")}</option>
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
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
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
                  <option value={0}>{t("wilayaPlaceholder")}</option>
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
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
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
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => (
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
  )
}
