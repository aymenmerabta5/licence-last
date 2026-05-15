"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { orpc } from "@/server/orpc/client"

interface DepartmentCategoryConfigProps {
  departmentId: string
}

export function DepartmentCategoryConfig({
  departmentId,
}: DepartmentCategoryConfigProps) {
  const t = useTranslations("dashboard.admin.departments")
  const queryClient = useQueryClient()

  const { data: allCategories, isLoading: isLoadingAll } = useQuery(
    orpc.skills.listCategories.queryOptions(),
  )

  const { data: assignedCategories, isLoading: isLoadingAssigned } = useQuery(
    orpc.departments.listCategories.queryOptions({
      input: { departmentId },
    }),
  )

  const [selected, setSelected] = useState<number[]>([])
  const [initialized, setInitialized] = useState(false)

  if (!initialized && assignedCategories) {
    setSelected(assignedCategories.map((c) => c.id))
    setInitialized(true)
  }

  const isDirty = useMemo(() => {
    if (!assignedCategories) return false
    const current = [...selected].sort((a, b) => a - b)
    const server = assignedCategories.map((c) => c.id).sort((a, b) => a - b)
    return (
      current.length !== server.length ||
      current.some((id, index) => id !== server[index])
    )
  }, [assignedCategories, selected])

  const assignMutation = useMutation({
    ...orpc.departments.assignCategories.mutationOptions(),
    onSuccess: () => {
      toast.success(t("categoriesSaveSuccess"))
      queryClient.invalidateQueries({
        queryKey: orpc.departments.listCategories.queryOptions({
          input: { departmentId },
        }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: orpc.departments.getSkills.queryOptions({
          input: { departmentId },
        }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: orpc.skills.listPrioritized.queryOptions({
          input: { departmentId },
        }).queryKey,
      })
    },
    onError: () => {
      toast.error(t("categoriesSaveError"))
    },
  })

  const toggleCategory = (categoryId: number) => {
    setSelected((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    )
  }

  const isLoading = isLoadingAll || isLoadingAssigned
  const isSaving = assignMutation.isPending

  return (
    <div className="space-y-3 border-t border-border/40 pt-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {t("categoriesTitle")}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {t("categoriesDescription")}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t("loading")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(allCategories ?? []).map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2.5 rounded-lg border border-border/40 p-2.5 transition-colors hover:bg-muted/30 cursor-pointer"
            >
              <Checkbox
                checked={selected.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <span className="text-sm text-foreground">{category.name}</span>
            </label>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="editorial"
          size="editorial-sm"
          className="rounded-none gap-2"
          onClick={() =>
            assignMutation.mutate({
              departmentId,
              categoryIds: selected,
            })
          }
          disabled={!isDirty || isSaving || isLoading}
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {t("saveCategories")}
        </Button>
      </div>
    </div>
  )
}
