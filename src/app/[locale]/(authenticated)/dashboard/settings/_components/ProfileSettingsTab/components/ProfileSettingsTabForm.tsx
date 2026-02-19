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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm pt-0">
        <CardHeader className="pt-7 relative overflow-hidden px-8 pb-5 border-b border-border/15 bg-gradient-to-b from-secondary/10 to-transparent">
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

            {isStudent && <StudentDetailsSection form={form} isBusy={isBusy} />}

            <FormActions form={form} isBusy={isBusy} onReset={resetToInitial} />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
