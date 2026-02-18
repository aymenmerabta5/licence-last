"use client"

import type { FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  return (
    <form
      onSubmit={onSubmit}
      className="border border-border/50 bg-card/40 p-5 sm:p-6 space-y-4"
    >
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">
          Invite Recruiter
        </p>
        <p className="text-xs text-muted-foreground">
          Add a teammate who can manage offers and candidate workflows.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          type="text"
          value={name}
          placeholder="Full name (optional)"
          onChange={(event) => onNameChange(event.target.value)}
        />
        <Input
          type="email"
          value={email}
          placeholder="work@email.com"
          required
          onChange={(event) => onEmailChange(event.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Inviting..." : "Invite Member"}
        </Button>
      </div>
    </form>
  )
}
