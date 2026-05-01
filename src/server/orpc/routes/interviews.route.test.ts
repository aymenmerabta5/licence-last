import { beforeEach, describe, expect, mock, test } from "bun:test"

const parserMap = new WeakMap<object, ((input: unknown) => unknown) | null>()

function createProcedureMock() {
  function create() {
    const self = {
      use() {
        const next = create()
        return next
      },

      input(schema: { parse: (value: unknown) => unknown }) {
        const next = create()
        parserMap.set(next, (input) => schema.parse(input))
        return next
      },

      handler<T extends (args: Record<string, unknown>) => Promise<unknown>>(
        fn: T,
      ) {
        return async (args: Record<string, unknown>) => {
          const inputParser = parserMap.get(self) ?? null
          const parsedInput = inputParser ? inputParser(args.input) : args.input

          return fn({
            ...args,
            input: parsedInput,
          })
        }
      },
    }
    parserMap.set(self, null)
    return self
  }

  return create()
}

async function callProcedure<T>(procedure: unknown, args: unknown): Promise<T> {
  return (procedure as (input: unknown) => Promise<T>)(args)
}

const listInterviewsForCompanyMock = mock(async () => ({ items: [] }))
const listInterviewsForStudentMock = mock(async () => ({ items: [] }))
const proposeInterviewSlotsMock = mock(async () => ({ interviewId: "int-1" }))
const confirmInterviewSlotMock = mock(async () => ({ confirmed: true }))
const getInterviewByIdMock = mock(async () => ({
  id: "int-1",
  applicationId: "app-1",
  offerId: "offer-1",
  offerTitle: "Test Offer",
  companyId: "company-1",
  companyName: "Test Company",
  companyLogoUrl: null,
  status: "pending_confirmation" as const,
  confirmedSlotId: null,
  confirmedAt: null,
  note: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  slots: [],
}))
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
  universityProcedureAssistant: createProcedureMock(),
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
mock.module("@/server/services/interviews/get-by-id", () => ({
  getInterviewById: getInterviewByIdMock,
}))

describe("src/server/orpc/routes/interviews", () => {
  beforeEach(() => {
    listInterviewsForCompanyMock.mockClear()
    listInterviewsForStudentMock.mockClear()
    proposeInterviewSlotsMock.mockClear()
    confirmInterviewSlotMock.mockClear()
    getInterviewByIdMock.mockClear()
    parseInputDateMock.mockClear()
    isFeatureEnabledMock.mockClear()
    isFeatureEnabledMock.mockImplementation(
      (flag: keyof typeof featureFlagsState) => featureFlagsState[flag],
    )
  })

  test("listInterviewsForCompanyProcedure delegates with company id and input", async () => {
    const { listInterviewsForCompanyProcedure } = await import(
      "@/server/orpc/routes/interviews"
    )

    const input = { status: "confirmed", limit: 20 as const }
    const result = await callProcedure(listInterviewsForCompanyProcedure, {
      input,
      context: { companyMembership: { companyId: "company-1" } },
    })

    expect(result).toEqual({ items: [] })
    expect(listInterviewsForCompanyMock).toHaveBeenCalledWith(
      "company-1",
      input,
    )
  })

  test("proposeInterviewSlotsProcedure parses dates and delegates", async () => {
    const { proposeInterviewSlotsProcedure } = await import(
      "@/server/orpc/routes/interviews"
    )

    const input = {
      applicationId: "app-1",
      note: "Please confirm",
      slots: [
        {
          startsAt: "2026-02-20T10:00:00.000Z",
          endsAt: "2026-02-20T11:00:00.000Z",
        },
      ],
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

  test("proposeInterviewSlotsProcedure rejects naive datetimes without timezone", async () => {
    const { proposeInterviewSlotsProcedure } = await import(
      "@/server/orpc/routes/interviews"
    )

    await expect(
      callProcedure(proposeInterviewSlotsProcedure, {
        input: {
          applicationId: "app-1",
          slots: [
            {
              startsAt: "2026-02-20T10:00:00",
              endsAt: "2026-02-20T11:00:00",
            },
          ],
        },
        context: {
          user: { id: "company-user-1" },
          companyMembership: { companyId: "company-1" },
        },
      }),
    ).rejects.toThrow()

    expect(parseInputDateMock).not.toHaveBeenCalled()
    expect(proposeInterviewSlotsMock).not.toHaveBeenCalled()
  })

  test("proposeInterviewSlotsProcedure rejects non-http(s) meeting urls", async () => {
    const { proposeInterviewSlotsProcedure } = await import(
      "@/server/orpc/routes/interviews"
    )

    await expect(
      callProcedure(proposeInterviewSlotsProcedure, {
        input: {
          applicationId: "app-1",
          slots: [
            {
              startsAt: "2026-02-20T10:00:00.000Z",
              endsAt: "2026-02-20T11:00:00.000Z",
              meetingUrl: "javascript:alert(1)",
            },
          ],
        },
        context: {
          user: { id: "company-user-1" },
          companyMembership: { companyId: "company-1" },
        },
      }),
    ).rejects.toThrow("Meeting URL must use http:// or https://")

    expect(proposeInterviewSlotsMock).not.toHaveBeenCalled()
  })

  test("proposeInterviewSlotsProcedure maps date parse errors to BAD_REQUEST", async () => {
    parseInputDateMock.mockImplementationOnce(() => {
      throw new Error("Interview slot 1 start is invalid")
    })

    const { proposeInterviewSlotsProcedure } = await import(
      "@/server/orpc/routes/interviews"
    )

    await expect(
      callProcedure(proposeInterviewSlotsProcedure, {
        input: {
          applicationId: "app-1",
          slots: [
            {
              startsAt: "2026-02-20T10:00:00.000Z",
              endsAt: "2026-02-20T11:00:00.000Z",
            },
          ],
        },
        context: {
          user: { id: "company-user-1" },
          companyMembership: { companyId: "company-1" },
        },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Interview slot 1 start is invalid",
    })

    expect(proposeInterviewSlotsMock).not.toHaveBeenCalled()
  })

  test("listInterviewsForStudentProcedure rejects when feature is disabled", async () => {
    isFeatureEnabledMock.mockImplementation(
      (flag: keyof typeof featureFlagsState) => {
        if (flag === "INTERVIEWS") return false
        return featureFlagsState[flag]
      },
    )
    const { listInterviewsForStudentProcedure } = await import(
      "@/server/orpc/routes/interviews"
    )

    await expect(
      callProcedure(listInterviewsForStudentProcedure, {
        context: { user: { id: "student-1" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      data: { code: "INTERVIEWS_FEATURE_DISABLED" },
    })
  })

  describe("getById", () => {
    test("returns interview data when found", async () => {
      const { getInterviewByIdProcedure } = await import(
        "@/server/orpc/routes/interviews"
      )

      const result = await callProcedure(getInterviewByIdProcedure, {
        input: { interviewId: "int-1" },
        context: { user: { id: "student-1" } },
      })

      expect(result).toMatchObject({ id: "int-1" })
      expect(getInterviewByIdMock).toHaveBeenCalledWith("int-1", "student-1")
    })

    test("returns 404 when interview not found", async () => {
      getInterviewByIdMock.mockImplementationOnce(async () => {
        const { InterviewServiceError } = await import(
          "@/server/services/interviews/errors"
        )
        throw new InterviewServiceError(
          "INTERVIEW_NOT_FOUND",
          "Interview not found",
        )
      })

      const { getInterviewByIdProcedure } = await import(
        "@/server/orpc/routes/interviews"
      )

      await expect(
        callProcedure(getInterviewByIdProcedure, {
          input: { interviewId: "missing" },
          context: { user: { id: "student-1" } },
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
      })
    })

    test("returns 403 when forbidden", async () => {
      getInterviewByIdMock.mockImplementationOnce(async () => {
        const { InterviewServiceError } = await import(
          "@/server/services/interviews/errors"
        )
        throw new InterviewServiceError(
          "INTERVIEW_FORBIDDEN",
          "You do not have access to this interview",
        )
      })

      const { getInterviewByIdProcedure } = await import(
        "@/server/orpc/routes/interviews"
      )

      await expect(
        callProcedure(getInterviewByIdProcedure, {
          input: { interviewId: "int-2" },
          context: { user: { id: "student-1" } },
        }),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
      })
    })
  })
})
