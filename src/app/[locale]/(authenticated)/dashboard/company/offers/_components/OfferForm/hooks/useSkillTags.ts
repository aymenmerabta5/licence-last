"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { orpc } from "@/server/orpc/client"

export function useSkillTags() {
  const { data: skillTagsResult } = useQuery(orpc.skills.list.queryOptions())

  const skillTags = useMemo(
    () => skillTagsResult?.skills ?? [],
    [skillTagsResult?.skills],
  )

  return skillTags
}
