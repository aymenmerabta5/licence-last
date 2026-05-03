"use client"

import { useMutation } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import { resolveLocalizedError } from "@/lib/error-message"
import { orpc } from "@/server/orpc/client"

interface UseRequestChangeFormParams {
  offerId: string
  companyName: string
}

export function useRequestChangeForm({
  offerId,
  companyName,
}: UseRequestChangeFormParams) {
  const t = useTranslations("dashboard.interviews.detail")
  const tCommon = useTranslations()
  const [body, setBody] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const sendMessageMutation = useMutation(
    orpc.messages.sendByStudent.mutationOptions({
      onSuccess: () => {
        setBody("")
        setIsExpanded(false)
        toast.success(t("requestChangeSuccess", { companyName }))
      },
      onError: (error) => {
        toast.error(
          resolveLocalizedError(error, {
            t: tCommon,
            fallbackKey: "errors.common.sendMessageFailed",
          }),
        )
      },
    }),
  )

  const submit = () => {
    const trimmed = body.trim()
    if (!trimmed) return
    sendMessageMutation.mutate({ offerId, body: trimmed })
  }

  return {
    body,
    setBody,
    isExpanded,
    setIsExpanded,
    isSubmitting: sendMessageMutation.isPending,
    submit,
  }
}
