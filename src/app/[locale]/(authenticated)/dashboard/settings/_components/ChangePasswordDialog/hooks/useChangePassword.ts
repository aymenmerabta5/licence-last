"use client"

import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { getErrorMessage } from "@/lib/error-message"
import { createChangePasswordSchema } from "@/lib/schemas/auth"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { orpc } from "@/server/orpc/client"

export function useChangePassword(onSuccess?: () => void) {
  const tv = useTranslations("auth.validation")
  const queryClient = useQueryClient()

  const [serverError, setServerError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const schema = createChangePasswordSchema(tv)

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = schema.safeParse(value)
        const fieldErrors = mapZodErrors(result)
        if (fieldErrors) return fieldErrors

        if (value.newPassword !== value.confirmNewPassword) {
          return { fields: { confirmNewPassword: tv("passwordMismatch") } }
        }

        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      setServerError("")
      setIsSuccess(false)

      try {
        const result = await authClient.changePassword({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: true,
        })

        if (result.error) {
          setServerError(result.error.message ?? "Could not change password.")
          return
        }

        await queryClient.invalidateQueries({
          queryKey: orpc.users.listMySessions.queryOptions().queryKey,
        })

        setIsSuccess(true)
        onSuccess?.()
      } catch (err) {
        setServerError(getErrorMessage(err, "Could not change password."))
      }
    },
  })

  function reset() {
    setServerError("")
    setIsSuccess(false)
    form.reset()
  }

  return { form, serverError, isSuccess, reset }
}
