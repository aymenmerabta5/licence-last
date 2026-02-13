"use client"

import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, FolderTree, Loader2 } from "lucide-react"

import { Link } from "@/i18n/routing"
import { reveal, ease } from "@/lib/animations"
import { orpc } from "@/server/orpc/client"

import { useDepartmentsData } from "./hooks/useDepartmentsData"
import { useDepartmentsActions } from "./hooks/useDepartmentsActions"
import { DepartmentCard } from "./components/DepartmentCard"
import { CreateDepartmentForm } from "./components/CreateDepartmentForm"

export function DepartmentsView() {
  const t = useTranslations("dashboard.departments")

  const { data: me } = useQuery(orpc.users.getMe.queryOptions())
  const universityId = me?.university?.id ?? null

  const { departments, isLoading } = useDepartmentsData(universityId)
  const actions = useDepartmentsActions()

  const handleAssignHead = (departmentId: string) => {
    const userId = window.prompt(t("assignHeadDescription"))
    if (!userId?.trim()) return
    actions.assignHeadMutation.mutate({ departmentId, userId: userId.trim() })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }}>
        <Link
          href={"/dashboard/admin" as "/dashboard"}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("backToDashboard")}
        </Link>

        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-heading tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            {t("description")}
          </p>
        </div>
      </motion.div>

      <motion.div {...reveal} transition={{ duration: 0.5, ease, delay: 0.1 }}>
        <CreateDepartmentForm
          name={actions.newName}
          onNameChange={actions.setNewName}
          headName={actions.newHeadName}
          onHeadNameChange={actions.setNewHeadName}
          isCreating={actions.isCreating}
          onSubmit={actions.handleCreate}
        />
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && departments.length === 0 && (
        <motion.div
          {...reveal}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
          className="border border-dashed border-border p-12 text-center space-y-2"
        >
          <FolderTree className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </motion.div>
      )}

      {departments.length > 0 && (
        <div className="space-y-3">
          {departments.map((dept, i) => (
            <motion.div
              key={dept.id}
              {...reveal}
              transition={{ duration: 0.4, ease, delay: 0.03 * i }}
            >
              <DepartmentCard
                department={dept}
                onAssignHead={handleAssignHead}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
