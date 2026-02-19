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
  listPendingApplications: mock(async () => ({ items: [] })),
}))
mock.module("@/server/services/placements/validate", () => ({
  validatePlacement: validatePlacementMock,
}))
mock.module("@/server/services/placements/reject", () => ({
  rejectPlacement: rejectPlacementMock,
}))

describe("src/server/orpc/routes/placements", () => {
  beforeEach(() => {
    validatePlacementMock.mockClear()
    rejectPlacementMock.mockClear()
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
})
