"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { orpc } from "@/server/orpc/client"

export function useSettingsData() {
  const [activeTab, setActiveTab] = useState("profile")

  const meQueryOptions = useMemo(() => orpc.users.getMe.queryOptions(), [])
  const profileQueryOptions = useMemo(
    () => orpc.students.getProfile.queryOptions(),
    [],
  )

  const meQuery = useQuery(meQueryOptions)
  const isStudent = meQuery.data?.user.role === "student"
  const profileQuery = useQuery({
    ...profileQueryOptions,
    enabled: isStudent,
  })

  return {
    activeTab,
    setActiveTab,
    me: meQuery.data,
    meLoading: meQuery.isLoading,
    studentProfile: profileQuery.data,
    profileLoading: profileQuery.isLoading,
    isStudent,
  }
}
