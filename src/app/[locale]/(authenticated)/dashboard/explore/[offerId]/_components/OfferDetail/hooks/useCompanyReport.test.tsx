import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"

const submitReportMock = mock(async () => ({ reportId: "report-1" }))
const submitQualityFeedbackMock = mock(async () => ({
  feedbackId: "feedback-1",
}))
const resolveReportMock = mock(async () => ({
  reportId: "report-1",
  status: "resolved",
}))
const toastSuccessMock = mock(() => {})
const toastErrorMock = mock(() => {})

mock.module("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

mock.module("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

mock.module("@/server/orpc/client", () => ({
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
    companies: {
      submitReport: {
        mutationOptions: (options: Record<string, unknown>) => ({
          mutationFn: submitReportMock,
          ...options,
        }),
      },
      submitQualityFeedback: {
        mutationOptions: (options: Record<string, unknown>) => ({
          mutationFn: submitQualityFeedbackMock,
          ...options,
        }),
      },
      resolveReport: {
        mutationOptions: (options: Record<string, unknown>) => ({
          mutationFn: resolveReportMock,
          ...options,
        }),
      },
      listTrustIndices: {
        queryOptions: () => ({
          queryKey: ["companies", "listTrustIndices"],
        }),
      },
      listReports: {
        queryOptions: ({ input }: { input: Record<string, unknown> }) => ({
          queryKey: ["companies", "listReports", input],
        }),
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

describe("useCompanyReport", () => {
  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    submitReportMock.mockClear()
    toastSuccessMock.mockClear()
    toastErrorMock.mockClear()
  })

  test("blocks submit and sets field errors for invalid payload", async () => {
    const { useCompanyReport } = await import(
      "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/hooks/useCompanyReport"
    )
    const { result } = renderHook(() => useCompanyReport("company-1"), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.submitReport()
    })

    expect(submitReportMock).not.toHaveBeenCalled()
    expect(result.current.errors.description).toBeDefined()
  })

  test("submits valid payload and closes dialog on success", async () => {
    const { useCompanyReport } = await import(
      "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/hooks/useCompanyReport"
    )
    const { result } = renderHook(() => useCompanyReport("company-1"), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.onOpenChange(true)
      result.current.setFieldValue(
        "description",
        "The offer details were misleading after I applied.",
      )
    })

    await act(async () => {
      result.current.submitReport()
      await Promise.resolve()
    })

    expect(result.current.errors).toEqual({})
  })
})
