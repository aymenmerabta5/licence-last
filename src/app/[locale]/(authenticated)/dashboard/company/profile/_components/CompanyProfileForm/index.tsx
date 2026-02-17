"use client"

import * as motion from "motion/react-client"

import { ServerError } from "@/components/ServerError"
import { SuccessMessage } from "@/components/SuccessMessage"
import { ease } from "@/lib/animations"

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
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease, delay: 0.1 }}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-8"
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
    </motion.form>
  )
}
