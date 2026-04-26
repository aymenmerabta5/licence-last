import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

import { ServiceError } from "@/server/services/errors"

function createProcedureMock() {
  return {
    use() {
      return this
    },
    input() {
      return this
    },
    handler<T>(fn: T) {
      return fn
    },
  }
}

async function callProcedure<T>(procedure: unknown, args: unknown): Promise<T> {
  return (procedure as (input: unknown) => Promise<T>)(args)
}

const validatePlacementMock = mock(async () => ({
  success: true,
  placementId: "placement-1",
  applicationId: "app-1",
}))
const rejectPlacementMock = mock(async () => ({
  success: true,
  applicationId: "app-1",
}))
const listPendingApplicationsMock = mock(async () => ({ items: [] }))
const getPendingApplicationByIdMock = mock(
  async (): Promise<Record<string, unknown> | null> => null,
)
const generateValidationSummaryMock = mock(async () => ({
  summary: "ok",
}))

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  adminProcedureGenerous: createProcedureMock(),
  adminProcedureStandard: createProcedureMock(),
  adminProcedureAssistant: createProcedureMock(),
  universityProcedureAssistant: createProcedureMock(),
  universityProcedureStandard: createProcedureMock(),
  deptHeadProcedureGenerous: createProcedureMock(),
  deptHeadProcedureStandard: createProcedureMock(),
}))

mock.module("@/server/orpc/utils/date", () => ({
  parseInputDate: (value: string, fieldLabel: string) => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`${fieldLabel} is invalid`)
    }
    return parsed
  },
  validatePlacementDateRange: (startDate: Date, endDate: Date) => {
    if (startDate >= endDate) {
      throw new Error("Start date must be before end date")
    }
  },
}))

mock.module("@/server/services/placements/list-pending", () => ({
  listPendingApplications: listPendingApplicationsMock,
}))
mock.module("@/server/services/placements/get-pending-by-id", () => ({
  getPendingApplicationById: getPendingApplicationByIdMock,
}))
mock.module("@/server/services/placements/validate", () => ({
  validatePlacement: validatePlacementMock,
}))
mock.module("@/server/services/placements/reject", () => ({
  rejectPlacement: rejectPlacementMock,
}))
mock.module("@/server/services/placements/generate-validation-summary", () => ({
  generateValidationSummary: generateValidationSummaryMock,
}))

describe("src/server/orpc/routes/placements", () => {
  let importCounter = 0

  async function importPlacementsRoute() {
    importCounter += 1
    return import(`@/server/orpc/routes/placements?test=${importCounter}`)
  }

  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    mock.module("@/server/orpc/rate-limited-procedures", () => ({
      publicProcedureStrict: createProcedureMock(),
      publicProcedureStandard: createProcedureMock(),
      authedSessionProcedureStandard: createProcedureMock(),
      authedSessionProcedureGenerous: createProcedureMock(),
      authedProcedureGenerous: createProcedureMock(),
      authedProcedureStandard: createProcedureMock(),
      authedProcedureStrict: createProcedureMock(),
      adminProcedureGenerous: createProcedureMock(),
      adminProcedureStandard: createProcedureMock(),
      adminProcedureAssistant: createProcedureMock(),
      universityProcedureAssistant: createProcedureMock(),
      universityProcedureStandard: createProcedureMock(),
      assistantProcedureLimited: createProcedureMock(),
      companyAdminProcedureAssistant: createProcedureMock(),
      companyAdminProcedureGenerous: createProcedureMock(),
      companyAdminProcedureStandard: createProcedureMock(),
      companyOwnerProcedureStandard: createProcedureMock(),
      companyOwnerProcedureGenerous: createProcedureMock(),
      studentProcedureGenerous: createProcedureMock(),
      studentProcedureStandard: createProcedureMock(),
      deptHeadProcedureGenerous: createProcedureMock(),
      deptHeadProcedureStandard: createProcedureMock(),
      superAdminProcedureGenerous: createProcedureMock(),
      superAdminProcedureStandard: createProcedureMock(),
    }))
    mock.module("@/server/orpc/utils/date", () => ({
      parseInputDate: (value: string, fieldLabel: string) => {
        const parsed = new Date(value)
        if (Number.isNaN(parsed.getTime())) {
          throw new Error(`${fieldLabel} is invalid`)
        }
        return parsed
      },
      validatePlacementDateRange: (startDate: Date, endDate: Date) => {
        if (startDate >= endDate) {
          throw new Error("Start date must be before end date")
        }
      },
    }))
    mock.module("@/server/services/placements/list-pending", () => ({
      listPendingApplications: listPendingApplicationsMock,
    }))
    mock.module("@/server/services/placements/get-pending-by-id", () => ({
      getPendingApplicationById: getPendingApplicationByIdMock,
    }))
    mock.module("@/server/services/placements/validate", () => ({
      validatePlacement: validatePlacementMock,
    }))
    mock.module("@/server/services/placements/reject", () => ({
      rejectPlacement: rejectPlacementMock,
    }))
    mock.module(
      "@/server/services/placements/generate-validation-summary",
      () => ({
        generateValidationSummary: generateValidationSummaryMock,
      }),
    )
    validatePlacementMock.mockClear()
    rejectPlacementMock.mockClear()
    listPendingApplicationsMock.mockClear()
    getPendingApplicationByIdMock.mockClear()
    generateValidationSummaryMock.mockClear()
  })

  test("validateProcedure delegates to service and returns success payload", async () => {
    const { validateProcedure } = await importPlacementsRoute()

    const result = await callProcedure(validateProcedure, {
      input: {
        applicationId: "app-1",
        startDate: "2026-02-01",
        endDate: "2026-05-01",
      },
      context: {
        user: {
          id: "admin-1",
          role: "university_admin",
          universityId: "uni-1",
        },
      },
    })

    expect(result).toEqual({
      success: true,
      placementId: "placement-1",
      applicationId: "app-1",
    })
    expect(validatePlacementMock).toHaveBeenCalledTimes(1)
  })

  test("validateProcedure maps typed placement errors", async () => {
    validatePlacementMock.mockRejectedValueOnce(
      new ServiceError(
        "PLACEMENT_ALREADY_EXISTS",
        "Placement already exists for this application",
      ),
    )
    const { validateProcedure } = await importPlacementsRoute()

    await expect(
      callProcedure(validateProcedure, {
        input: {
          applicationId: "app-1",
          startDate: "2026-02-01",
          endDate: "2026-05-01",
        },
        context: {
          user: {
            id: "admin-1",
            role: "university_admin",
            universityId: "uni-1",
          },
        },
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Placement already exists for this application",
    })
  })

  test("validateProcedure forbids super_admin", async () => {
    const { validateProcedure } = await importPlacementsRoute()

    await expect(
      callProcedure(validateProcedure, {
        input: {
          applicationId: "app-1",
          startDate: "2026-02-01",
          endDate: "2026-05-01",
        },
        context: {
          user: {
            id: "super-admin-1",
            role: "super_admin",
            universityId: null,
          },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "University admin access required",
    })
    expect(validatePlacementMock).not.toHaveBeenCalled()
  })

  test("rejectProcedure maps scope errors to forbidden", async () => {
    rejectPlacementMock.mockRejectedValueOnce(
      new ServiceError(
        "PLACEMENT_SCOPE_FORBIDDEN_UNIVERSITY",
        "You do not have access to reject this application",
      ),
    )
    const { rejectProcedure } = await importPlacementsRoute()

    await expect(
      callProcedure(rejectProcedure, {
        input: { applicationId: "app-1", reason: "missing docs" },
        context: {
          user: {
            id: "admin-1",
            role: "university_admin",
            universityId: "uni-1",
          },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    })
  })

  test("listPendingProcedure delegates for university_admin", async () => {
    const { listPendingProcedure } = await importPlacementsRoute()

    const result = await callProcedure(listPendingProcedure, {
      input: { limit: 20 },
      context: {
        user: {
          id: "admin-1",
          role: "university_admin",
          universityId: "uni-1",
        },
      },
    })

    expect(result).toEqual({ items: [] })
    expect(listPendingApplicationsMock).toHaveBeenCalledTimes(1)
    expect(listPendingApplicationsMock).toHaveBeenCalledWith(
      { limit: 20 },
      { role: "university_admin", universityId: "uni-1" },
    )
  })

  test("getPendingByIdProcedure delegates for university_admin", async () => {
    getPendingApplicationByIdMock.mockResolvedValueOnce({ id: "app-1" })
    const { getPendingByIdProcedure } = await importPlacementsRoute()

    const result = await callProcedure(getPendingByIdProcedure, {
      input: { applicationId: "app-1" },
      context: {
        user: {
          id: "admin-1",
          role: "university_admin",
          universityId: "uni-1",
        },
      },
    })

    expect(result).toEqual({ application: { id: "app-1" } })
    expect(getPendingApplicationByIdMock).toHaveBeenCalledWith("app-1", {
      role: "university_admin",
      universityId: "uni-1",
    })
  })

  test("rejectProcedure forbids super_admin", async () => {
    const { rejectProcedure } = await importPlacementsRoute()

    await expect(
      callProcedure(rejectProcedure, {
        input: { applicationId: "app-1", reason: "missing docs" },
        context: {
          user: {
            id: "super-admin-1",
            role: "super_admin",
            universityId: null,
          },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "University admin access required",
    })
    expect(rejectPlacementMock).not.toHaveBeenCalled()
  })

  test("listPendingProcedure forbids super_admin", async () => {
    const { listPendingProcedure } = await importPlacementsRoute()

    await expect(
      callProcedure(listPendingProcedure, {
        input: { limit: 20 },
        context: {
          user: {
            id: "super-admin-1",
            role: "super_admin",
            universityId: null,
          },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "University admin access required",
    })
    expect(listPendingApplicationsMock).not.toHaveBeenCalled()
  })

  test("getPendingByIdProcedure forbids super_admin", async () => {
    const { getPendingByIdProcedure } = await importPlacementsRoute()

    await expect(
      callProcedure(getPendingByIdProcedure, {
        input: { applicationId: "app-1" },
        context: {
          user: {
            id: "super-admin-1",
            role: "super_admin",
            universityId: null,
          },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "University admin access required",
    })
    expect(getPendingApplicationByIdMock).not.toHaveBeenCalled()
  })

  test("generateValidationSummaryProcedure forbids super_admin", async () => {
    const { generateValidationSummaryProcedure } = await importPlacementsRoute()

    await expect(
      callProcedure(generateValidationSummaryProcedure, {
        input: {
          application: {
            id: "app-1",
            studentName: "Student One",
          },
        },
        context: {
          user: {
            id: "super-admin-1",
            role: "super_admin",
            universityId: null,
          },
        },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Super admin cannot access placement validations",
    })
  })

  test("generateValidationSummaryProcedure allows university_admin", async () => {
    const { generateValidationSummaryProcedure } = await importPlacementsRoute()

    const result = await callProcedure(generateValidationSummaryProcedure, {
      input: {
        application: {
          id: "app-1",
          studentName: "Student One",
        },
      },
      context: {
        user: {
          id: "admin-1",
          role: "university_admin",
          universityId: "uni-1",
        },
      },
    })

    expect(result).toEqual({ summary: "ok" })
    expect(generateValidationSummaryMock).toHaveBeenCalledTimes(1)
  })

  test("generateValidationSummaryProcedure allows dept_head", async () => {
    const { generateValidationSummaryProcedure } = await importPlacementsRoute()

    const result = await callProcedure(generateValidationSummaryProcedure, {
      input: {
        application: {
          id: "app-1",
          studentName: "Student One",
        },
      },
      context: {
        user: {
          id: "dept-head-1",
          role: "department_head",
          universityId: "uni-1",
          departmentId: "dep-1",
        },
      },
    })

    expect(result).toEqual({ summary: "ok" })
    expect(generateValidationSummaryMock).toHaveBeenCalledTimes(1)
  })

  test("generateValidationSummaryProcedure maps AI errors to service unavailable", async () => {
    generateValidationSummaryMock.mockRejectedValueOnce(
      new Error("provider unavailable"),
    )
    const { generateValidationSummaryProcedure } = await importPlacementsRoute()

    await expect(
      callProcedure(generateValidationSummaryProcedure, {
        input: {
          application: {
            id: "app-1",
            studentName: "Student One",
          },
        },
        context: {
          user: {
            id: "admin-1",
            role: "university_admin",
            universityId: "uni-1",
          },
        },
      }),
    ).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      message:
        "AI service is temporarily unavailable. Please try again shortly.",
    })
  })

  test("deptHeadGetPendingByIdProcedure delegates for department scope", async () => {
    getPendingApplicationByIdMock.mockResolvedValueOnce({ id: "app-1" })
    const { deptHeadGetPendingByIdProcedure } = await importPlacementsRoute()

    const result = await callProcedure(deptHeadGetPendingByIdProcedure, {
      input: { applicationId: "app-1" },
      context: {
        user: {
          id: "dept-head-1",
          role: "department_head",
        },
        universityId: "uni-1",
        departmentId: "dep-1",
      },
    })

    expect(result).toEqual({ application: { id: "app-1" } })
    expect(getPendingApplicationByIdMock).toHaveBeenCalledWith("app-1", {
      role: "department_head",
      universityId: "uni-1",
      departmentId: "dep-1",
    })
  })
})
