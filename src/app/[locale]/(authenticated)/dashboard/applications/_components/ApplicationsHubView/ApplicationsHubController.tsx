"use client"

import { ApplicationsHubView } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView"
import { useApplicationHub } from "@/app/[locale]/(authenticated)/dashboard/applications/_components/ApplicationsHubView/hooks/useApplicationHub"

export function ApplicationsHubController() {
  const hub = useApplicationHub()
  return <ApplicationsHubView {...hub} />
}
