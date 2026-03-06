import { beforeEach, describe, expect, mock, test } from "bun:test"
import { renderHook } from "@testing-library/react"

const usePathnameMock = mock(() => "/dashboard")
const logoutMock = mock(async () => {})
const isSavedOffersEnabledOnClientMock = mock(() => true)
const isInterviewsEnabledOnClientMock = mock(() => true)

mock.module("@/i18n/routing", () => ({
  usePathname: usePathnameMock,
}))

mock.module("@/hooks/useLogout", () => ({
  useLogout: () => ({
    logout: logoutMock,
    isLoggingOut: false,
  }),
}))

mock.module("@/lib/feature-flags-client", () => ({
  isSavedOffersEnabledOnClient: isSavedOffersEnabledOnClientMock,
  isInterviewsEnabledOnClient: isInterviewsEnabledOnClientMock,
}))

const { useSidebar } = await import(
  "@/app/[locale]/(authenticated)/_components/DashboardSidebar/hooks/useSidebar"
)

describe("useSidebar", () => {
  beforeEach(() => {
    usePathnameMock.mockClear()
    logoutMock.mockClear()
    isSavedOffersEnabledOnClientMock.mockClear()
    isInterviewsEnabledOnClientMock.mockClear()

    isSavedOffersEnabledOnClientMock.mockImplementation(() => true)
    isInterviewsEnabledOnClientMock.mockImplementation(() => true)
  })

  test("hides saved offers nav item when the flag is off", () => {
    isSavedOffersEnabledOnClientMock.mockImplementation(() => false)

    const { result } = renderHook(() => useSidebar("student"))
    const labelKeys = result.current.filteredItems.map((item) => item.labelKey)

    expect(labelKeys).not.toContain("savedOffers")
    expect(labelKeys).toContain("interviews")
  })

  test("hides interviews nav item when the flag is off", () => {
    isInterviewsEnabledOnClientMock.mockImplementation(() => false)

    const { result } = renderHook(() => useSidebar("student"))
    const labelKeys = result.current.filteredItems.map((item) => item.labelKey)

    expect(labelKeys).toContain("savedOffers")
    expect(labelKeys).not.toContain("interviews")
  })

  test("hides company governance items for recruiters", () => {
    const { result } = renderHook(() =>
      useSidebar("company_admin", "recruiter"),
    )
    const labelKeys = result.current.filteredItems.map((item) => item.labelKey)

    expect(labelKeys).not.toContain("companyProfile")
    expect(labelKeys).not.toContain("teamMembers")
    expect(labelKeys).toContain("companyDocuments")
    expect(labelKeys).toContain("manageOffers")
  })

  test("keeps company governance items for owners", () => {
    const { result } = renderHook(() => useSidebar("company_admin", "owner"))
    const labelKeys = result.current.filteredItems.map((item) => item.labelKey)

    expect(labelKeys).toContain("companyProfile")
    expect(labelKeys).toContain("teamMembers")
  })
})
