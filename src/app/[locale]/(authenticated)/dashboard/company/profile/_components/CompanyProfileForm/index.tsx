"use client"

import { ServerError } from "@/components/ServerError"
import { SuccessMessage } from "@/components/SuccessMessage"

import { useCompanyProfileForm } from "./hooks/useCompanyProfileForm"
import { LogoUploadSection } from "./components/LogoUploadSection"
import { ProfileFieldsSection } from "./components/ProfileFieldsSection"
import { FormActions } from "./components/FormActions"
import type { CompanyProfileFormProps } from "./types"

export function CompanyProfileForm({ initialData }: CompanyProfileFormProps) {
  const {
    form,
    serverError,
    successMessage,
    logoUrl,
    isUploading,
    handleLogoUpload,
  } = useCompanyProfileForm(initialData)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-7"
    >
      <ServerError message={serverError} />
      <SuccessMessage message={successMessage} />

      <LogoUploadSection
        logoUrl={logoUrl}
        isUploading={isUploading}
        onUpload={handleLogoUpload}
      />

      <ProfileFieldsSection form={form} />

      <FormActions form={form} />
    </form>
  )
}
