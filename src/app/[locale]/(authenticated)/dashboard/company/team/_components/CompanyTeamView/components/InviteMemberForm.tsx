"use client"

import type { FormEvent } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InviteMemberFormProps {
  email: string
  name: string
  isPending: boolean
  onEmailChange: (value: string) => void
  onNameChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function InviteMemberForm({
  email,
  name,
  isPending,
  onEmailChange,
  onNameChange,
  onSubmit,
}: InviteMemberFormProps) {
  const t = useTranslations("dashboard.company.team")
  const nameId = "company-team-invite-name"
  const emailId = "company-team-invite-email"

  return (
    <form
      onSubmit={onSubmit}
      className="border border-border/50 bg-card/40 p-5 sm:p-6 space-y-4"
    >
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">
          {t("inviteKicker")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("inviteDescription")}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={nameId} className="text-xs text-muted-foreground">
            {t("nameLabel")}
          </Label>
          <Input
            id={nameId}
            type="text"
            value={name}
            placeholder={t("namePlaceholder")}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={emailId} className="text-xs text-muted-foreground">
            {t("emailLabel")}
          </Label>
          <Input
            id={emailId}
            type="email"
            value={email}
            placeholder={t("emailPlaceholder")}
            required
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? t("inviting") : t("inviteButton")}
        </Button>
      </div>
    </form>
  )
}
