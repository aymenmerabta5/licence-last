"use client"

import { useTranslations } from "next-intl"
import { FileText, Briefcase } from "lucide-react"
import * as motion from "motion/react-client"
import { reveal, ease } from "@/lib/animations"
import { Label } from "@/components/ui/label"
import { errorMessage } from "@/lib/schemas/auth"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

interface BasicInfoSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  const t = useTranslations("dashboard.company.offers.form")

  return (
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
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
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

      {/* Description */}
      <form.Field name="description">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => (
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
    </motion.div>
  )
}
