"use client"

import { User } from "lucide-react"
import { useTranslations } from "next-intl"
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

  const t = useTranslations("dashboard.settings")

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="border border-border/60 bg-card/30 dark:bg-card/50 overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/40 bg-muted/20 dark:bg-muted/10">
          <User className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-lg text-heading">{t("profileIdentity")}</h2>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm font-light text-muted-foreground">
            {t("profileIdentityDescription")}
          </p>
        </div>
      </div>

      <ServerError message={serverError} />
      <SuccessMessage message={successTick > 0 ? t("saved") : ""} />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="space-y-8"
      >
        <form.Subscribe selector={(state) => [state.values.name] as const}>
          {([name]) => {
            const avatarInitial = (name.trim().charAt(0) || "A").toUpperCase()
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

        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="h-4 w-0.5 bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {t("personalInformation")}
            </span>
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
    </div>
  )
}
