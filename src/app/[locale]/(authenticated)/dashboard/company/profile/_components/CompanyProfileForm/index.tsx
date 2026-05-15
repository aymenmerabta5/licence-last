"use client"

import * as motion from "motion/react-client"
import { DeleteCompanySection } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/components/DeleteCompanySection"
import { FormActions } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/components/FormActions"
import { LogoUploadSection } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/components/LogoUploadSection"
import { ProfileFieldsSection } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/components/ProfileFieldsSection"
import { useCompanyProfileForm } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/hooks/useCompanyProfileForm"
import type { CompanyProfileFormProps } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/types"
import { ServerError } from "@/components/ServerError"
import { SuccessMessage } from "@/components/SuccessMessage"
import { ease, reveal } from "@/lib/animations"

export function CompanyProfileForm({ initialData }: CompanyProfileFormProps) {
  const {
    form,
    serverError,
    successMessage,
    logoUrl,
    isUploading,
    handleLogoUpload,
    deleteCompanyError,
    isDeletingCompany,
    handleDeleteCompany,
  } = useCompanyProfileForm(initialData)

  return (
    <motion.form
      {...reveal}
      transition={{ duration: 0.6, ease, delay: 0.1 }}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-6"
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

      {initialData.canDeleteCompany && (
        <DeleteCompanySection
          companyName={initialData.companyName}
          onConfirmDelete={handleDeleteCompany}
          isDeleting={isDeletingCompany}
          errorMessage={deleteCompanyError}
        />
      )}
    </motion.form>
  )
}
