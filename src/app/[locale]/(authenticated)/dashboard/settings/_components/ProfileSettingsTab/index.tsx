"use client"

import { Fingerprint } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServerError } from "@/components/ServerError"
import { SuccessMessage } from "@/components/SuccessMessage"

import { useProfileSettings } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/hooks/useProfileSettings"
import { AvatarSection } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/components/AvatarSection"
import { PersonalInfoSection } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/components/PersonalInfoSection"
import { StudentDetailsSection } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/components/StudentDetailsSection"
import { FormActions } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/components/FormActions"
import type { ProfileSettingsTabProps } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/types"

export type { ProfileSettingsTabProps }

export function ProfileSettingsTab({
  me,
  studentProfile,
  isLoading,
}: ProfileSettingsTabProps) {
  if (isLoading || !me) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
          <CardHeader className="bg-gradient-to-b from-secondary/15 to-transparent px-8 py-10 border-b border-border/15">
            <CardTitle className="font-serif text-2xl">
              Profile Identity
            </CardTitle>
            <CardDescription className="font-medium">
              Loading your settings...
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="h-24 w-24 rounded-2xl bg-secondary/20 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-secondary/20 rounded animate-pulse" />
                <div className="h-3 w-48 bg-secondary/15 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-secondary/15 rounded-xl animate-pulse" />
              <div className="h-12 bg-secondary/15 rounded-xl animate-pulse" />
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
  const {
    form,
    isStudent,
    isBusy,
    serverError,
    successTick,
    resetToInitial,
    avatarUrl,
    isAvatarUploading,
    avatarInputRef,
    handleAvatarUpload,
  } = useProfileSettings(me, studentProfile)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Profile card */}
      <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm pt-0">
        <CardHeader className="pt-7 relative overflow-hidden px-8 pb-5 border-b border-border/15 bg-gradient-to-b from-secondary/10 to-transparent">
          {/* Decorative watermark */}
          <div
            className="absolute inset-y-0 end-8 flex items-center opacity-[0.03] pointer-events-none"
            aria-hidden="true"
          >
            <Fingerprint className="h-24 w-24" />
          </div>

          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <Fingerprint className="h-3.5 w-3.5 text-primary" />
            </span>
            <CardTitle className="font-serif text-2xl tracking-tight">
              Profile Identity
            </CardTitle>
          </div>
          <CardDescription className="font-medium ps-10">
            How companies and administrators see you on the platform.
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
                return (
                  <AvatarSection
                    avatarInitial={avatarInitial}
                    imageUrl={avatarUrl}
                    isUploading={isAvatarUploading}
                    inputRef={avatarInputRef}
                    onUpload={handleAvatarUpload}
                  />
                )
              }}
            </form.Subscribe>

            {/* Section: Personal Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/20" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 shrink-0">
                  Personal Information
                </span>
                <div className="h-px flex-1 bg-border/20" />
              </div>

              <PersonalInfoSection
                form={form}
                email={me.user.email ?? ""}
                isBusy={isBusy}
              />
            </div>

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
