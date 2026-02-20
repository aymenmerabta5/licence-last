"use client"

import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import type { CompanyProfileFormProps } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/types"
import { useRouter } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"
import { getErrorMessage } from "@/lib/error-message"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { createCompanyProfileSchema } from "@/lib/schemas/offer"
import { orpcClient } from "@/server/orpc/client"

export function useCompanyProfileForm(
  initialData: CompanyProfileFormProps["initialData"],
) {
  const t = useTranslations("dashboard.company.profile")
  const tv = useTranslations("auth.validation")
  const router = useRouter()

  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [deleteCompanyError, setDeleteCompanyError] = useState("")
  const [isDeletingCompany, setIsDeletingCompany] = useState(false)

  const schema = useMemo(() => createCompanyProfileSchema(tv), [tv])

  const form = useForm({
    defaultValues: {
      description: initialData.description,
      logoUrl: initialData.logoUrl,
      websiteUrl: initialData.websiteUrl,
      phone: initialData.phone,
      contactEmail: initialData.contactEmail,
      representativeName: initialData.representativeName,
      wilayaCode: initialData.wilayaCode,
      address: initialData.address,
    },
    validators: {
      onSubmit: ({ value }) => mapZodErrors(schema.safeParse(value)),
    },
    onSubmit: async ({ value }) => {
      setServerError("")
      setSuccessMessage("")

      try {
        await orpcClient.companies.update({
          description: value.description || undefined,
          logoUrl: value.logoUrl || undefined,
          websiteUrl: value.websiteUrl || undefined,
          phone: value.phone || undefined,
          contactEmail: value.contactEmail || undefined,
          representativeName: value.representativeName || undefined,
          wilayaCode: value.wilayaCode || undefined,
          address: value.address || undefined,
        })

        setSuccessMessage(t("success"))
        toast.success(t("success"))
      } catch {
        const message = t("error")
        setServerError(message)
        toast.error(message)
      }
    },
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setServerError("")

    try {
      const result = await orpcClient.companies.uploadLogo({ file })
      setLogoUrl(result.url)
      form.setFieldValue("logoUrl", result.url)
      toast.success(t("logoUploadSuccess"))
    } catch {
      const message = t("error")
      setServerError(message)
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteCompany = async () => {
    setDeleteCompanyError("")

    try {
      setIsDeletingCompany(true)
      await orpcClient.companies.deleteOwn({})

      await authClient.getSession({ query: { disableCookieCache: true } })
      toast.success(t("deleteCompany.success"))
      router.push("/onboarding/company")
    } catch (error) {
      const message = getErrorMessage(error, t("deleteCompany.error"))
      setDeleteCompanyError(message)
      toast.error(message)
    } finally {
      setIsDeletingCompany(false)
    }
  }

  return {
    form,
    serverError,
    successMessage,
    logoUrl,
    isUploading,
    handleLogoUpload,
    deleteCompanyError,
    isDeletingCompany,
    handleDeleteCompany,
  }
}
