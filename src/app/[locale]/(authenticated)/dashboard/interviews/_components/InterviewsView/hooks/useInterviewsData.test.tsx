import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"
import { renderHook, waitFor } from "@testing-library/react"

const listInterviewsForStudentQueryOptionsMock = mock(() => ({
  queryKey: ["interviews", "student"],
  queryFn: async () => [],
}))
const listInterviewsForCompanyQueryOptionsMock = mock(() => ({
  queryKey: ["interviews", "company"],
  queryFn: async () => [],
}))
const listByCompanyQueryOptionsMock = mock(() => ({
  queryKey: ["offers", "listByCompany"],
  queryFn: async () => [{ id: "offer-1", title: "Backend Internship" }],
}))
const listByOfferQueryOptionsMock = mock(
  ({ input }: { input: Record<string, unknown> }) => ({
    queryKey: ["applications", "listByOffer", input],
    queryFn: async () => ({
      applications: [
        {
          id: "app-1",
          student: { name: "Alex Student" },
          pipelineStage: "applied",
          createdAt: "2026-02-20T10:00:00.000Z",
        },
      ],
    }),
  }),
)
const confirmSlotMutationFnMock = mock(async () => ({ confirmed: true }))
const toastSuccessMock = mock(() => {})
const toastErrorMock = mock(() => {})
let importCounter = 0
const invalidateQueriesMock = mock(async () => undefined)

function applyReactQueryMock() {
  mock.module("@tanstack/react-query", () => ({
    useQuery: (options?: { enabled?: boolean; queryKey?: unknown[] }) => {
      if (options?.enabled === false) {
        return { data: undefined, isLoading: false, error: null }
      }

      const scope = Array.isArray(options?.queryKey)
        ? options.queryKey[0]
        : null

      if (scope === "offers") {
        return {
          data: [{ id: "offer-1", title: "Backend Internship" }],
          isLoading: false,
          error: null,
        }
      }

      if (scope === "applications") {
        return {
          data: {
            applications: [
              {
                id: "app-1",
                student: { name: "Alex Student" },
                pipelineStage: "applied",
                createdAt: "2026-02-20T10:00:00.000Z",
              },
            ],
          },
          isLoading: false,
          error: null,
        }
      }

      return { data: [], isLoading: false, error: null }
    },
    useQueryClient: () => ({
      invalidateQueries: invalidateQueriesMock,
    }),
    useMutation: (options?: {
      mutationFn?: (input: unknown) => Promise<unknown>
    }) => ({
      mutateAsync: async (input: unknown) => options?.mutationFn?.(input),
      isPending: false,
      error: null,
    }),
  }))
}

mock.module("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

mock.module("next-intl", () => ({
  useTranslations: () => (key: string) =>
    ({
      "errors.common.interviewSlotConfirmed": "Interview slot confirmed.",
      "errors.common.confirmInterviewSlotFailed":
        "Could not confirm this slot.",
      "errors.common.interviewProposalSent": "Interview proposal sent.",
      "errors.common.interviewProposalFailed":
        "Could not send interview proposal.",
      "errors.common.selectApplication": "Please select an application.",
      "errors.common.invalidApplicationSelection":
        "Please select a valid application for this offer.",
      "errors.common.interviewSlotRequired":
        "Add at least one complete interview slot.",
      "errors.common.interviewDateTimeInvalid":
        "Each slot must include a valid start and end date/time.",
    })[key] ?? key,
}))

function applyOrpcClientMock() {
  mock.module("@/server/orpc/client", () => ({
    orpcClient: {},
    orpc: {
      placements: {
        getPendingById: {
          queryOptions: ({ input }: { input: { applicationId: string } }) => ({
            queryKey: ["placements", "getPendingById", input],
            queryFn: async () => ({ application: { id: input.applicationId } }),
          }),
        },
      },
      deptHead: {
        getPendingById: {
          queryOptions: ({ input }: { input: { applicationId: string } }) => ({
            queryKey: ["deptHead", "getPendingById", input],
            queryFn: async () => ({ application: { id: input.applicationId } }),
          }),
        },
      },
      interviews: {
        listForStudent: {
          queryOptions: listInterviewsForStudentQueryOptionsMock,
        },
        listForCompany: {
          queryOptions: listInterviewsForCompanyQueryOptionsMock,
        },
        confirmSlot: {
          mutationOptions: (options: Record<string, unknown>) => ({
            mutationFn: confirmSlotMutationFnMock,
            ...options,
          }),
        },
      },
      offers: {
        listByCompany: {
          queryOptions: listByCompanyQueryOptionsMock,
        },
      },
      applications: {
        listByOffer: {
          queryOptions: listByOfferQueryOptionsMock,
        },
      },
    },
  }))
}

applyOrpcClientMock()

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }
}

async function loadUseInterviewsData() {
  importCounter += 1
  return import(
    `@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData?test=${importCounter}`
  )
}

describe("useInterviewsData", () => {
  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    applyReactQueryMock()
    applyOrpcClientMock()
    listInterviewsForStudentQueryOptionsMock.mockClear()
    listInterviewsForCompanyQueryOptionsMock.mockClear()
    listByCompanyQueryOptionsMock.mockClear()
    listByOfferQueryOptionsMock.mockClear()
    confirmSlotMutationFnMock.mockClear()
    toastSuccessMock.mockClear()
    toastErrorMock.mockClear()
  })

  test("requests applied applications only", async () => {
    const { useInterviewsData } = await loadUseInterviewsData()

    renderHook(
      () =>
        useInterviewsData({
          role: "company_admin",
          selectedOfferId: "offer-1",
        }),
      {
        wrapper: createWrapper(),
      },
    )

    await waitFor(() => {
      expect(listByOfferQueryOptionsMock).toHaveBeenCalledWith({
        input: {
          offerId: "offer-1",
          status: "applied",
          limit: 50,
        },
      })
    })
  })
})
