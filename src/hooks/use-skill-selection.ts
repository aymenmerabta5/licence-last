import { useCallback, useState } from "react"

export function useSkillSelection(maxSelections: number = 10) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggle = useCallback(
    (skillId: string) => {
      setSelectedIds((prev) => {
        if (prev.includes(skillId)) {
          return prev.filter((id) => id !== skillId)
        }
        if (prev.length >= maxSelections) {
          return prev
        }
        return [...prev, skillId]
      })
    },
    [maxSelections],
  )

  const isSelected = useCallback(
    (skillId: string) => selectedIds.includes(skillId),
    [selectedIds],
  )

  const isAtMax = selectedIds.length >= maxSelections
  const count = selectedIds.length

  const reset = useCallback(() => setSelectedIds([]), [])

  const setSelected = useCallback((ids: string[]) => setSelectedIds(ids), [])

  return {
    selectedIds,
    setSelectedIds: setSelected,
    toggle,
    isSelected,
    isAtMax,
    count,
    maxSelections,
    reset,
  }
}
