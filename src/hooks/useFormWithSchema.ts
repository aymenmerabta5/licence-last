"use client"

import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useTranslations } from "next-intl"
import { mapZodErrors } from "@/lib/schemas/map-errors"
import { getErrorMessage } from "@/lib/error-message"
import type { ZodType } from "zod"

interface UseFormWithSchemaOptions<TValues extends Record<string, unknown>> {
  schemaFactory: (t: (key: string) => string) => ZodType
  /** Translation namespace for validation messages. Defaults to "auth.validation". */
  validationNamespace?: string
  defaultValues: TValues
  onSubmit: (value: TValues) => Promise<void>
}

/**
 * Shared hook that wires up TanStack Form with a Zod schema factory and
 * the standard serverError / setServerError pattern used across auth forms.
 */
export function useFormWithSchema<TValues extends Record<string, unknown>>({
  schemaFactory,
  validationNamespace = "auth.validation",
  defaultValues,
  onSubmit,
}: UseFormWithSchemaOptions<TValues>) {
  const tv = useTranslations(validationNamespace)
  const [serverError, setServerError] = useState("")

  const schema = useMemo(() => schemaFactory(tv), [tv, schemaFactory])

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }: { value: TValues }) => mapZodErrors(schema.safeParse(value)),
    },
    onSubmit: async ({ value }: { value: TValues }) => {
      setServerError("")
      try {
        await onSubmit(value)
      } catch (err) {
        setServerError(getErrorMessage(err, "Something went wrong"))
      }
    },
  })

  return { form, serverError, setServerError, schema }
}
