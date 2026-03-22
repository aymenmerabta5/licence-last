"use client"

import { Fingerprint } from "lucide-react"
import { AvatarSection } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/components/AvatarSection"
import { FormActions } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/components/FormActions"
import { PersonalInfoSection } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/components/PersonalInfoSection"
import { StudentDetailsSection } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/components/StudentDetailsSection"
import { useProfileSettings } from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/hooks/useProfileSettings"
import type {
  MeResult,
  StudentProfileResult,
} from "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/types"
import { ServerError } from "@/components/ServerError"
import { SuccessMessage } from "@/components/SuccessMessage"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ProfileSettingsTabFormProps {
  me: MeResult
  studentProfile: StudentProfileResult | null
}

export function ProfileSettingsTabForm({
  me,
  studentProfile,
}: ProfileSettingsTabFormProps) {
  const {
    form,
    isStudent,
    isBusy,
    serverError,
    successTick,
    resetToInitial,
    avatarUrl,
    isAvatarUploading,
    isAvatarDeleting,
    avatarInputRef,
    handleAvatarUpload,
    handleAvatarDelete,
  } = useProfileSettings(me, studentProfile)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
      <Card className="border-border/60 bg-card rounded-[2.5rem] overflow-hidden shadow-sm ring-1 ring-border/5">
        <CardHeader className="relative overflow-hidden px-8 pt-10 pb-8 sm:px-12 sm:pt-12 sm:pb-10 border-b border-border/20 bg-transparent">
          <div
            className="absolute -top-12 -end-8 flex items-center opacity-[0.02] dark:opacity-[0.05] pointer-events-none scale-[2] rotate-12"
            aria-hidden="true"
          >
            <Fingerprint className="h-64 w-64 text-primary" />
          </div>

          <div className="relative z-10 flex items-center gap-4 mb-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
              <Fingerprint className="h-6 w-6" />
            </span>
            <CardTitle className="font-serif text-3xl sm:text-4xl text-heading tracking-tight">
              Profile Identity
            </CardTitle>
          </div>
          <CardDescription className="relative z-10 text-base font-medium text-muted-foreground/80 sm:ps-16 max-w-xl">
            This information governs how companies and administrators perceive
            your digital presence across the platform.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 sm:p-12 space-y-12 bg-transparent">
          <ServerError message={serverError} />
          <SuccessMessage message={successTick > 0 ? "Saved." : ""} />

          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-8"
          >
            <form.Subscribe selector={(state) => [state.values.name] as const}>
              {([name]) => {
                const avatarInitial = (
                  name.trim().charAt(0) || "A"
                ).toUpperCase()
                return (
                  <AvatarSection
                    avatarInitial={avatarInitial}
                    imageUrl={avatarUrl}
                    isUploading={isAvatarUploading}
                    isDeleting={isAvatarDeleting}
                    inputRef={avatarInputRef}
                    onUpload={handleAvatarUpload}
                    onDelete={handleAvatarDelete}
                  />
                )
              }}
            </form.Subscribe>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/40" />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary/60 shrink-0 flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-primary/40 inline-block" />
                  Personal Information
                  <span className="h-1 w-1 rounded-full bg-primary/40 inline-block" />
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/40" />
              </div>

              <PersonalInfoSection
                form={form}
                email={me.user.email ?? ""}
                isBusy={isBusy}
              />
            </div>

            {isStudent && <StudentDetailsSection form={form} isBusy={isBusy} />}

            <FormActions form={form} isBusy={isBusy} onReset={resetToInitial} />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
