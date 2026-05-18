"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

interface UseDepartmentSkillsModalOptions {
  toggleSkill: (skillId: string) => void
  setQuery: (value: string) => void
  createSkill: (opts: { name: string; force?: boolean }) => Promise<unknown>
  t: (key: string, values?: Record<string, string | number>) => string
}

export function useDepartmentSkillsModal({
  toggleSkill,
  setQuery,
  createSkill,
  t,
}: UseDepartmentSkillsModalOptions) {
  const [similarSkills, setSimilarSkills] = useState<
    Array<{ id: string; name: string }> | null
  >(null)
  const [showCategories, setShowCategories] = useState(false)

  const dismissSimilar = useCallback(() => {
    setSimilarSkills(null)
  }, [])

  const toggleCategories = useCallback(() => {
    setShowCategories((prev) => !prev)
  }, [])

  const resetModal = useCallback(() => {
    setSimilarSkills(null)
    setShowCategories(false)
  }, [])

  async function handleCreateSkill(query: string) {
    const trimmed = query.trim()
    if (!trimmed) return
    try {
      const result = (await createSkill({ name: trimmed })) as {
        status?: string
        similar?: Array<{ id: string; name: string }>
        name?: string
        id?: string
      }
      if (result.status === "similar_exists") {
        setSimilarSkills(result.similar ?? null)
        return
      }
      toast.success(t("createSkillSuccess", { name: result.name ?? trimmed }))
      if (result.id) toggleSkill(result.id)
      setQuery("")
      setSimilarSkills(null)
    } catch {
      toast.error(t("createSkillError"))
    }
  }

  async function handleForceCreate(query: string) {
    const trimmed = query.trim()
    if (!trimmed) return
    try {
      const result = (await createSkill({ name: trimmed, force: true })) as {
        status?: string
        similar?: Array<{ id: string; name: string }>
        name?: string
        id?: string
      }
      if (result.status === "similar_exists") {
        setSimilarSkills(result.similar ?? null)
        return
      }
      toast.success(t("createSkillSuccess", { name: result.name ?? trimmed }))
      if (result.id) toggleSkill(result.id)
      setQuery("")
      setSimilarSkills(null)
    } catch {
      toast.error(t("createSkillError"))
    }
  }

  function handleUseExisting(skillId: string) {
    toggleSkill(skillId)
    setSimilarSkills(null)
    setQuery("")
    toast.success(t("useExisting"))
  }

  return {
    similarSkills,
    showCategories,
    dismissSimilar,
    toggleCategories,
    resetModal,
    handleCreateSkill,
    handleForceCreate,
    handleUseExisting,
  }
}
