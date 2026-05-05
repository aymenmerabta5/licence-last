"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { resolveLocalizedError } from "@/lib/error-message"
import { orpc } from "@/server/orpc/client"

const FIELDS_LIST_QUERY_KEY = orpc.fields.list.queryOptions().queryKey[0]

export function useFieldsActions() {
  const tr = useTranslations()
  const t = useTranslations("dashboard.admin.fields")
  const queryClient = useQueryClient()

  const listQueryKey = [FIELDS_LIST_QUERY_KEY]

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: listQueryKey })
  }

  const createMutation = useMutation({
    ...orpc.fields.create.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: listQueryKey })
      const previousData = queryClient.getQueryData(listQueryKey)
      queryClient.setQueryData(listQueryKey, (old) => {
        if (!old || typeof old !== "object" || Array.isArray(old) || !Array.isArray((old as Record<string, unknown>).fields))
          return old
        return {
          ...old,
          fields: [
            ...(old as Record<string, unknown[]>).fields,
            {
              id: `optimistic-${Date.now()}`,
              name: variables.name,
              slug: `optimistic-${Date.now()}`,
              description: variables.description ?? null,
              skillCount: 0,
            },
          ],
        }
      })
      return { previousData }
    },
    onSuccess: () => {
      invalidate()
      toast.success(t("createSuccess"))
    },
    onError: (error, _variables, context) => {
      toast.error(
        resolveLocalizedError(error, {
          t: tr,
          fallbackKey: "dashboard.admin.fields.error",
        }),
      )
      if (context?.previousData) {
        queryClient.setQueryData(listQueryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listQueryKey })
    },
  })

  const deleteMutation = useMutation({
    ...orpc.fields.delete.mutationOptions(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: listQueryKey })
      const previousData = queryClient.getQueryData(listQueryKey)
      queryClient.setQueryData(listQueryKey, (old) => {
        if (!old || typeof old !== "object" || Array.isArray(old) || !Array.isArray((old as Record<string, unknown>).fields))
          return old
        return {
          ...old,
          fields: (old as Record<string, Array<{ id: string }>>).fields.filter(
            (field) => field.id !== variables.fieldId,
          ),
        }
      })
      return { previousData }
    },
    onSuccess: () => {
      invalidate()
      toast.success(t("deleteSuccess"))
    },
    onError: (error, _variables, context) => {
      toast.error(
        resolveLocalizedError(error, {
          t: tr,
          fallbackKey: "dashboard.admin.fields.error",
        }),
      )
      if (context?.previousData) {
        queryClient.setQueryData(listQueryKey, context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listQueryKey })
    },
  })

  const createField = async (name: string, description?: string) => {
    await createMutation.mutateAsync({ name, description })
  }

  const deleteField = async (fieldId: string) => {
    await deleteMutation.mutateAsync({ fieldId })
  }

  return {
    createField,
    deleteField,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
