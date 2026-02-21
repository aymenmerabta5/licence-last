import { beforeEach, describe, expect, mock, test } from "bun:test"

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
const generateValidationSummaryMock = mock(async () => ({
  summary: "ok",
}))

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  adminProcedureGenerous: createProcedureMock(),
  adminProcedureStandard: createProcedureMock(),
  adminProcedureAssistant: createProcedureMock(),
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
  beforeEach(() => {
    validatePlacementMock.mockClear()
    rejectPlacementMock.mockClear()
    listPendingApplicationsMock.mockClear()
    generateValidationSummaryMock.mockClear()
  })

  test("validateProcedure delegates to service and returns success payload", async () => {
    const { validateProcedure } = await import(
      "@/server/orpc/routes/placements"
    )

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
    const { validateProcedure } = await import(
      "@/server/orpc/routes/placements"
    )

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
    const { validateProcedure } = await import(
      "@/server/orpc/routes/placements"
    )

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
    const { rejectProcedure } = await import("@/server/orpc/routes/placements")

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
    const { listPendingProcedure } = await import(
      "@/server/orpc/routes/placements"
    )

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

  test("rejectProcedure forbids super_admin", async () => {
    const { rejectProcedure } = await import("@/server/orpc/routes/placements")

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
    const { listPendingProcedure } = await import(
      "@/server/orpc/routes/placements"
    )

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

  test("generateValidationSummaryProcedure forbids super_admin", async () => {
    const { generateValidationSummaryProcedure } = await import(
      "@/server/orpc/routes/placements"
    )

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
    const { generateValidationSummaryProcedure } = await import(
      "@/server/orpc/routes/placements"
    )

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
    const { generateValidationSummaryProcedure } = await import(
      "@/server/orpc/routes/placements"
    )

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
          role: "dept_head",
          universityId: "uni-1",
          departmentId: "dep-1",
        },
      },
    })

    expect(result).toEqual({ summary: "ok" })
    expect(generateValidationSummaryMock).toHaveBeenCalledTimes(1)
  })
})
