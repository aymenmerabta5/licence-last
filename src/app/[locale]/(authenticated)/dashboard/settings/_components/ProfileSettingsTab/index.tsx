"use client"

import { User } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServerError } from "@/components/ServerError"
import { SuccessMessage } from "@/components/SuccessMessage"

import { useProfileSettings } from "./hooks/useProfileSettings"
import { AvatarSection } from "./components/AvatarSection"
import { PersonalInfoSection } from "./components/PersonalInfoSection"
import { StudentDetailsSection } from "./components/StudentDetailsSection"
import { FormActions } from "./components/FormActions"
import type { ProfileSettingsTabProps } from "./types"

export type { ProfileSettingsTabProps }

export function ProfileSettingsTab({
  me,
  studentProfile,
  isLoading,
}: ProfileSettingsTabProps) {
  if (isLoading || !me) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
        <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
          <CardHeader className="bg-secondary/10 px-8 py-10 border-b border-border/20">
            <CardTitle className="font-serif text-2xl">
              Profile Identity
            </CardTitle>
            <CardDescription className="font-medium">
              Loading your settings...
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-3">
              <div className="h-4 w-2/3 bg-secondary/30 rounded" />
              <div className="h-4 w-1/2 bg-secondary/30 rounded" />
              <div className="h-4 w-3/5 bg-secondary/30 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ProfileSettingsTabForm me={me} studentProfile={studentProfile ?? null} />
  )
}

function ProfileSettingsTabForm({
  me,
  studentProfile,
}: {
  me: NonNullable<ProfileSettingsTabProps["me"]>
  studentProfile: NonNullable<ProfileSettingsTabProps["studentProfile"]> | null
}) {
  const { form, isStudent, isBusy, serverError, successTick, resetToInitial } =
    useProfileSettings(me, studentProfile)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="bg-secondary/10 px-8 py-10 relative overflow-hidden border-b border-border/20">
          <div
            className="absolute inset-y-0 end-6 flex items-center opacity-[0.06] pointer-events-none"
            aria-hidden="true"
          >
            <User className="h-44 w-44" />
          </div>
          <CardTitle className="font-serif text-2xl">
            Profile Identity
          </CardTitle>
          <CardDescription className="font-medium">
            Information that will be visible to companies and administrators
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          <ServerError message={serverError} />
          <SuccessMessage message={successTick > 0 ? "Saved." : ""} />

          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-8"
          >
            <form.Subscribe
              selector={(state) => [state.values.name] as const}
            >
              {([name]) => {
                const avatarInitial = (name.trim().charAt(0) || "A").toUpperCase()
                return <AvatarSection avatarInitial={avatarInitial} />
              }}
            </form.Subscribe>

            <div className="h-px bg-border/20 w-full" />

            <PersonalInfoSection
              form={form}
              email={me.user.email ?? ""}
              isBusy={isBusy}
            />

            {isStudent && (
              <StudentDetailsSection form={form} isBusy={isBusy} />
            )}

            <FormActions form={form} isBusy={isBusy} onReset={resetToInitial} />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
