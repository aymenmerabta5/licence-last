import { beforeEach, describe, expect, mock, test } from "bun:test"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"

const submitFeedbackMock = mock(async () => ({ feedbackId: "feedback-1" }))
const submitReportMock = mock(async () => ({ reportId: "report-1" }))
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
    companies: {
      submitReport: {
        mutationOptions: (options: Record<string, unknown>) => ({
          mutationFn: submitReportMock,
          ...options,
        }),
      },
      submitQualityFeedback: {
        mutationOptions: (options: Record<string, unknown>) => ({
          mutationFn: submitFeedbackMock,
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
  queryClient.invalidateQueries =
    invalidateQueriesMock as typeof queryClient.invalidateQueries

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return { Wrapper, invalidateQueriesMock }
}

describe("useCompanyFeedback", () => {
  beforeEach(() => {
    submitFeedbackMock.mockClear()
    toastSuccessMock.mockClear()
    toastErrorMock.mockClear()
  })

  test("blocks submission when validation fails", async () => {
    const { useCompanyFeedback } = await import(
      "@/app/[locale]/(authenticated)/dashboard/student/documents/_components/DocumentsView/hooks/useCompanyFeedback"
    )
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useCompanyFeedback(), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.openForPlacement({
        placementId: "placement-1",
        companyName: "Acme",
        offerTitle: "Frontend Intern",
      })
      result.current.setFieldValue("rating", 0)
    })

    act(() => {
      result.current.submitFeedback()
    })

    expect(submitFeedbackMock).not.toHaveBeenCalled()
    expect(result.current.errors.rating).toBeDefined()
  })

  test("submits feedback and resets dialog state on success", async () => {
    const { useCompanyFeedback } = await import(
      "@/app/[locale]/(authenticated)/dashboard/student/documents/_components/DocumentsView/hooks/useCompanyFeedback"
    )
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useCompanyFeedback(), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.openForPlacement({
        placementId: "placement-1",
        companyName: "Acme",
        offerTitle: "Frontend Intern",
      })
      result.current.setFieldValue("rating", 5)
      result.current.setFieldValue(
        "comment",
        "Great mentoring and project scope.",
      )
    })

    await act(async () => {
      result.current.submitFeedback()
      await Promise.resolve()
    })

    expect(result.current.errors).toEqual({})
  })
})
