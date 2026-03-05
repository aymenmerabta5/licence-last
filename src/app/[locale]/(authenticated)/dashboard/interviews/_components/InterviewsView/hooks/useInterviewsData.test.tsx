import { beforeEach, describe, expect, mock, test } from "bun:test"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"

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
const proposeSlotsMutationFnMock = mock(async () => ({ interviewId: "int-1" }))
const toastSuccessMock = mock(() => {})
const toastErrorMock = mock(() => {})

mock.module("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

mock.module("@/server/orpc/client", () => ({
  orpc: {
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
      proposeSlots: {
        mutationOptions: (options: Record<string, unknown>) => ({
          mutationFn: proposeSlotsMutationFnMock,
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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe("useInterviewsData", () => {
  beforeEach(() => {
    listInterviewsForStudentQueryOptionsMock.mockClear()
    listInterviewsForCompanyQueryOptionsMock.mockClear()
    listByCompanyQueryOptionsMock.mockClear()
    listByOfferQueryOptionsMock.mockClear()
    confirmSlotMutationFnMock.mockClear()
    proposeSlotsMutationFnMock.mockClear()
    toastSuccessMock.mockClear()
    toastErrorMock.mockClear()
  })

  test("requests applied applications only", async () => {
    const { useInterviewsData } = await import(
      "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData"
    )

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

  test("converts local datetime slot values to ISO before mutation", async () => {
    const { useInterviewsData } = await import(
      "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData"
    )

    const { result } = renderHook(
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
      expect(result.current.companyApplications).toHaveLength(1)
    })

    const localStart = "2026-02-20T10:00"
    const localEnd = "2026-02-20T11:00"
    let didSubmit = false

    await act(async () => {
      didSubmit = await result.current.proposeSlots({
        applicationId: "app-1",
        note: "Interview proposal",
        slots: [
          {
            id: "slot-1",
            startsAt: localStart,
            endsAt: localEnd,
            location: "",
            meetingUrl: "",
          },
        ],
      })
    })

    expect(didSubmit).toBe(true)
    expect(proposeSlotsMutationFnMock).toHaveBeenCalledTimes(1)
    const firstCall = proposeSlotsMutationFnMock.mock.calls[0]
    if (!firstCall) {
      throw new Error("Expected proposeSlots mutation to be called")
    }
    const payload = (firstCall as unknown as [unknown])[0] as {
      slots: Array<{ startsAt: string; endsAt: string }>
    }
    expect(payload.slots[0]?.startsAt).toBe(new Date(localStart).toISOString())
    expect(payload.slots[0]?.endsAt).toBe(new Date(localEnd).toISOString())
  })

  test("blocks proposal when datetime-local value is invalid", async () => {
    const { useInterviewsData } = await import(
      "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/hooks/useInterviewsData"
    )

    const { result } = renderHook(
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
      expect(result.current.companyApplications).toHaveLength(1)
    })

    let didSubmit = true
    await act(async () => {
      didSubmit = await result.current.proposeSlots({
        applicationId: "app-1",
        note: "",
        slots: [
          {
            id: "slot-1",
            startsAt: "not-a-date",
            endsAt: "2026-02-20T11:00",
            location: "",
            meetingUrl: "",
          },
        ],
      })
    })

    expect(didSubmit).toBe(false)
    expect(proposeSlotsMutationFnMock).not.toHaveBeenCalled()
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Each slot must include a valid start and end date/time.",
    )
  })
})
