"use client"

import { useMemo, useState } from "react"
import { navItems } from "@/app/[locale]/(authenticated)/_components/DashboardSidebar/constants"
import { useLogout } from "@/hooks/useLogout"
import { usePathname } from "@/i18n/routing"
import {
  isCompanyAssistantEnabledOnClient,
  isInterviewsEnabledOnClient,
  isSavedOffersEnabledOnClient,
} from "@/lib/feature-flags-client"

export function useSidebar(
  role: string,
  companyMembershipRole?: string | null,
  universityMembershipRole?: string | null,
) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout } = useLogout()
  const savedOffersEnabled = isSavedOffersEnabledOnClient()
  const interviewsEnabled = isInterviewsEnabledOnClient()
  const companyAssistantEnabled = isCompanyAssistantEnabledOnClient()

  const filteredItems = useMemo(
    () =>
      navItems.filter((item) => {
        if (item.labelKey === "savedOffers" && !savedOffersEnabled) {
          return false
        }
        if (item.labelKey === "interviews" && !interviewsEnabled) {
          return false
        }
        if (item.labelKey === "assistant" && !companyAssistantEnabled) {
          return false
        }
        if (
          role === "company_admin" &&
          item.companyMembershipRoles &&
          !item.companyMembershipRoles.includes(companyMembershipRole ?? "")
        ) {
          return false
        }
        if (
          role === "university_admin" &&
          item.universityMembershipRoles &&
          !item.universityMembershipRoles.includes(universityMembershipRole ?? "")
        ) {
          return false
        }
        if (
          role === "university_admin" &&
          item.hideForUniversityMembershipRoles?.includes(
            universityMembershipRole ?? "",
          )
        ) {
          return false
        }
        return item.roles.includes(role)
      }),
    [
      companyAssistantEnabled,
      companyMembershipRole,
      universityMembershipRole,
      interviewsEnabled,
      role,
      savedOffersEnabled,
    ],
  )

  return { isCollapsed, setIsCollapsed, filteredItems, pathname, logout }
}
