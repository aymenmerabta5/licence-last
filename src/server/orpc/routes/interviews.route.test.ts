import { beforeEach, describe, expect, mock, test } from "bun:test"

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

const listInterviewsForCompanyMock = mock(async () => ({ items: [] }))
const listInterviewsForStudentMock = mock(async () => ({ items: [] }))
const proposeInterviewSlotsMock = mock(async () => ({ interviewId: "int-1" }))
const confirmInterviewSlotMock = mock(async () => ({ confirmed: true }))
const parseInputDateMock = mock((value: string, fieldLabel: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldLabel} is invalid`)
  }
  return parsed
})
const featureFlagsState = {
  NOTIF_PREFERENCES: true,
  SAVED_OFFERS: true,
  INTERVIEWS: true,
  LANGUAGE_REQUIREMENTS: true,
}
const isFeatureEnabledMock = mock(
  (flag: keyof typeof featureFlagsState) => featureFlagsState[flag],
)

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
  superAdminProcedureGenerous: createProcedureMock(),
  superAdminProcedureStandard: createProcedureMock(),
  assistantProcedureLimited: createProcedureMock(),
  companyAdminProcedureAssistant: createProcedureMock(),
  companyAdminProcedureGenerous: createProcedureMock(),
  companyAdminProcedureStandard: createProcedureMock(),
  studentProcedureGenerous: createProcedureMock(),
  studentProcedureStandard: createProcedureMock(),
  deptHeadProcedureStandard: createProcedureMock(),
  deptHeadProcedureGenerous: createProcedureMock(),
}))
mock.module("@/lib/feature-flags", () => ({
  FEATURE_FLAGS: featureFlagsState,
  isFeatureEnabled: isFeatureEnabledMock,
}))
mock.module("@/server/orpc/utils/date", () => ({
  parseInputDate: parseInputDateMock,
  validatePlacementDateRange: (startDate: Date, endDate: Date) => {
    if (startDate >= endDate) {
      throw new Error("Start date must be before end date")
    }
  },
}))
mock.module("@/server/services/interviews/list-for-company", () => ({
  listInterviewsForCompany: listInterviewsForCompanyMock,
}))
mock.module("@/server/services/interviews/list-for-student", () => ({
  listInterviewsForStudent: listInterviewsForStudentMock,
}))
mock.module("@/server/services/interviews/propose", () => ({
  proposeInterviewSlots: proposeInterviewSlotsMock,
}))
mock.module("@/server/services/interviews/confirm", () => ({
  confirmInterviewSlot: confirmInterviewSlotMock,
}))

describe("src/server/orpc/routes/interviews", () => {
  beforeEach(() => {
    listInterviewsForCompanyMock.mockClear()
    listInterviewsForStudentMock.mockClear()
    proposeInterviewSlotsMock.mockClear()
    confirmInterviewSlotMock.mockClear()
    parseInputDateMock.mockClear()
    isFeatureEnabledMock.mockClear()
    isFeatureEnabledMock.mockImplementation(
      (flag: keyof typeof featureFlagsState) => featureFlagsState[flag],
    )
  })

  test("listInterviewsForCompanyProcedure delegates with company id and input", async () => {
    const { listInterviewsForCompanyProcedure } = await import("@/server/orpc/routes/interviews")

    const input = { status: "confirmed", limit: 20 as const }
    const result = await callProcedure(listInterviewsForCompanyProcedure, {
      input,
      context: { companyMembership: { companyId: "company-1" } },
    })

    expect(result).toEqual({ items: [] })
    expect(listInterviewsForCompanyMock).toHaveBeenCalledWith("company-1", input)
  })

  test("proposeInterviewSlotsProcedure parses dates and delegates", async () => {
    const { proposeInterviewSlotsProcedure } = await import("@/server/orpc/routes/interviews")

    const input = {
      applicationId: "app-1",
      note: "Please confirm",
      slots: [{ startsAt: "2026-02-20T10:00:00.000Z", endsAt: "2026-02-20T11:00:00.000Z" }],
    }

    const result = await callProcedure(proposeInterviewSlotsProcedure, {
      input,
      context: {
        user: { id: "company-user-1" },
        companyMembership: { companyId: "company-1" },
      },
    })

    expect(result).toEqual({ interviewId: "int-1" })
    expect(parseInputDateMock).toHaveBeenCalledTimes(2)
    expect(proposeInterviewSlotsMock).toHaveBeenCalledWith(
      {
        applicationId: "app-1",
        note: "Please confirm",
        slots: [
          {
            startsAt: new Date("2026-02-20T10:00:00.000Z"),
            endsAt: new Date("2026-02-20T11:00:00.000Z"),
            location: null,
            meetingUrl: null,
          },
        ],
      },
      "company-1",
      "company-user-1",
    )
  })

  test("listInterviewsForStudentProcedure rejects when feature is disabled", async () => {
    isFeatureEnabledMock.mockImplementation((flag: keyof typeof featureFlagsState) => {
      if (flag === "INTERVIEWS") return false
      return featureFlagsState[flag]
    })
    const { listInterviewsForStudentProcedure } = await import("@/server/orpc/routes/interviews")

    await expect(
      callProcedure(listInterviewsForStudentProcedure, {
        context: { user: { id: "student-1" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "Interviews feature is disabled",
    })
  })
})
