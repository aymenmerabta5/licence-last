"use client"

import { Loader2, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateFieldFormProps {
  onSubmit: (name: string, description: string) => void
  isSubmitting: boolean
}

export function CreateFieldForm({
  onSubmit,
  isSubmitting,
}: CreateFieldFormProps) {
  const t = useTranslations("dashboard.admin.fields")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit(name.trim(), description.trim())
    setName("")
    setDescription("")
  }

  return (
    <section className="relative overflow-hidden border border-border/50 bg-background p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0" />

      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus className="h-3.5 w-3.5" />
          </span>
          <h3 className="font-serif text-xl text-heading">
            {t("addField")}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
              {t("name")} *
            </Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="h-10 rounded-xl border-border/60"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
              {t("description")}
            </Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={3}
              className="w-full rounded-none border border-input bg-transparent ps-3 pe-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !name.trim()}
          variant="editorial"
          size="editorial-sm"
          className="rounded-lg"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {t("save")}
        </Button>
      </div>
    </section>
  )
}
