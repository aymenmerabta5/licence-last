"use client"

import { useTranslations } from "next-intl"
import { Globe, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { errorMessage } from "@/lib/schemas/auth"
import type { UniversityOnboardingFormApi } from "@/app/[locale]/onboarding/university/_components/UniversityOnboardingForm/hooks/useUniversityOnboarding"

interface DomainFieldsProps {
  form: UniversityOnboardingFormApi
}

export function DomainFields({ form }: DomainFieldsProps) {
  const t = useTranslations("onboarding.university")

  return (
    <form.Field name="domains">
      {(field) => {
        const domains = field.state.value
        const fieldError =
          field.state.meta.errors.length > 0
            ? errorMessage(field.state.meta.errors[0])
            : undefined

        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Globe className="inline-block h-3.5 w-3.5 me-1.5 -mt-0.5" />
                {t("domains")}
              </Label>
              <p className="text-[11px] text-muted-foreground/70">
                {t("domainsHint")}
              </p>
            </div>

            <div className="space-y-2">
              {domains.map((domain, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={domain}
                    onChange={(e) => {
                      const updated = [...domains]
                      updated[index] = e.target.value
                      field.handleChange(updated)
                    }}
                    placeholder={t("domainPlaceholder")}
                    className="h-11 border-border/40 bg-background text-sm"
                  />
                  {domains.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        const updated = domains.filter((_, i) => i !== index)
                        field.handleChange(updated)
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">{t("removeDomain")}</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 text-xs border-dashed"
              onClick={() => field.handleChange([...domains, ""])}
            >
              <Plus className="h-3.5 w-3.5 me-1.5" />
              {t("addDomain")}
            </Button>

            {fieldError && (
              <p className="text-xs text-destructive">{fieldError}</p>
            )}
          </div>
        )
      }}
    </form.Field>
  )
}
