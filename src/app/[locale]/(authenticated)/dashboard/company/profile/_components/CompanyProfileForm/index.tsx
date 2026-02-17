"use client"

import * as motion from "motion/react-client"

import { ServerError } from "@/components/ServerError"
import { SuccessMessage } from "@/components/SuccessMessage"
import { ease } from "@/lib/animations"

import { useCompanyProfileForm } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/hooks/useCompanyProfileForm"
import { LogoUploadSection } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/components/LogoUploadSection"
import { ProfileFieldsSection } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/components/ProfileFieldsSection"
import { FormActions } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/components/FormActions"
import type { CompanyProfileFormProps } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/types"

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
