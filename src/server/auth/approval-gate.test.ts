import { beforeEach, describe, expect, mock, test } from "bun:test"

import { checkAdminApproval } from "@/server/auth/approval-gate"

const mockGetCompanyStatusByUserId = mock(async () => null as { status: string } | null)
const mockGetUniversityStatusByUserId = mock(async () => null as { status: string } | null)

describe("checkAdminApproval", () => {
  beforeEach(() => {
    mockGetCompanyStatusByUserId.mockClear()
    mockGetUniversityStatusByUserId.mockClear()
    mockGetCompanyStatusByUserId.mockResolvedValue(null)
    mockGetUniversityStatusByUserId.mockResolvedValue(null)
  })

  test("allows non-admin roles", async () => {
    const result = await checkAdminApproval(
      {
        id: "student-1",
        role: "student",
        onboardingCompleted: true,
      },
      {
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
      },
    )

    expect(result).toEqual({ ok: true })
  })

  test("skips approval checks before onboarding completion", async () => {
    const result = await checkAdminApproval(
      {
        id: "company-1",
        role: "company_admin",
        onboardingCompleted: false,
      },
      {
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
      },
    )

    expect(result).toEqual({ ok: true })
    expect(mockGetCompanyStatusByUserId).not.toHaveBeenCalled()
    expect(mockGetUniversityStatusByUserId).not.toHaveBeenCalled()
  })

  test("allows approved company admins", async () => {
    mockGetCompanyStatusByUserId.mockResolvedValue({ status: "approved" })

    const result = await checkAdminApproval(
      {
        id: "company-2",
        role: "company_admin",
        onboardingCompleted: true,
      },
      {
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
      },
    )

    expect(result).toEqual({ ok: true })
  })

  test("maps suspended companies to suspended denial", async () => {
    mockGetCompanyStatusByUserId.mockResolvedValue({ status: "suspended" })

    const result = await checkAdminApproval(
      {
        id: "company-3",
        role: "company_admin",
        onboardingCompleted: true,
      },
      {
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
      },
    )

    expect(result).toEqual({ ok: false, reason: "company_suspended" })
  })

  test("maps rejected companies to rejected denial", async () => {
    mockGetCompanyStatusByUserId.mockResolvedValue({ status: "rejected" })

    const result = await checkAdminApproval(
      {
        id: "company-4",
        role: "company_admin",
        onboardingCompleted: true,
      },
      {
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
      },
    )

    expect(result).toEqual({ ok: false, reason: "company_rejected" })
  })

  test("maps university statuses correctly", async () => {
    mockGetUniversityStatusByUserId.mockResolvedValue({ status: "pending" })

    const pendingResult = await checkAdminApproval(
      {
        id: "uni-1",
        role: "university_admin",
        onboardingCompleted: true,
      },
      {
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
      },
    )

    expect(pendingResult).toEqual({ ok: false, reason: "university_pending" })

    mockGetUniversityStatusByUserId.mockResolvedValue({ status: "rejected" })
    const rejectedResult = await checkAdminApproval(
      {
        id: "uni-1",
        role: "university_admin",
        onboardingCompleted: true,
      },
      {
        getCompanyStatusByUserId: mockGetCompanyStatusByUserId,
        getUniversityStatusByUserId: mockGetUniversityStatusByUserId,
      },
    )
    expect(rejectedResult).toEqual({ ok: false, reason: "university_rejected" })
  })
})
