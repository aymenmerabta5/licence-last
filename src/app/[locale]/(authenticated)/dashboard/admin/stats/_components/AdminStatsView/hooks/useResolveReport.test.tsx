import { beforeEach, describe, expect, mock, test } from "bun:test"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"

const resolveReportMock = mock(async () => ({ reportId: "report-1", status: "resolved" }))
const submitReportMock = mock(async () => ({ reportId: "report-1" }))
const submitQualityFeedbackMock = mock(async () => ({ feedbackId: "feedback-1" }))
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
  const invalidateQueriesMock = mock(async () => undefined)
  queryClient.invalidateQueries = invalidateQueriesMock as typeof queryClient.invalidateQueries

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return { Wrapper, invalidateQueriesMock }
}

describe("useResolveReport", () => {
  beforeEach(() => {
    resolveReportMock.mockClear()
    toastSuccessMock.mockClear()
    toastErrorMock.mockClear()
  })

  test("resolves a report and invalidates open report query", async () => {
    const { useResolveReport } = await import(
      "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/hooks/useResolveReport"
    )
    const { Wrapper, invalidateQueriesMock } = createWrapper()
    const { result } = renderHook(() => useResolveReport(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.resolveReport({
        reportId: "report-1",
        status: "resolved",
        resolutionNote: "Reviewed and addressed with the company.",
      })
      await Promise.resolve()
    })

    const firstCall = resolveReportMock.mock.calls[0] as unknown as
      | [Record<string, unknown>]
      | undefined

    expect(resolveReportMock).toHaveBeenCalledTimes(1)
    expect(firstCall?.[0]).toMatchObject({
      reportId: "report-1",
      status: "resolved",
      resolutionNote: "Reviewed and addressed with the company.",
    })
    expect(invalidateQueriesMock).toHaveBeenCalledTimes(1)
    expect(toastSuccessMock).toHaveBeenCalledTimes(1)
  })
})
