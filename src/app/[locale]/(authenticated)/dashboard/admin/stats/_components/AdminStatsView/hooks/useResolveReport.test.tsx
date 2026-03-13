import { beforeEach, describe, expect, mock, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"

const mutateAsyncMock = mock(async (_variables: unknown) => undefined)
const invalidateQueriesMock = mock(async () => undefined)
const toastSuccessMock = mock(() => undefined)
const toastErrorMock = mock(() => undefined)
const useMutationMock = mock((options: Record<string, unknown>) => ({
  isPending: false,
  mutateAsync: async (variables: unknown) => {
    await mutateAsyncMock(variables)
    const onSuccess = options.onSuccess as
      | ((data: unknown, variables: { status: string }) => Promise<void> | void)
      | undefined

    if (onSuccess) {
      await onSuccess(undefined, variables as { status: string })
    }
  },
}))

mock.module("sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

mock.module("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
  }),
}))

mock.module("@/server/orpc/client", () => ({
  orpc: {
    companies: {
      resolveReport: {
        mutationOptions: (options: Record<string, unknown>) => options,
      },
      listReports: {
        queryOptions: ({ input }: { input: { status: string; limit: number } }) => ({
          queryKey: ["companies", "listReports", input],
        }),
      },
    },
  },
}))

describe("useResolveReport", () => {
  beforeEach(() => {
    useMutationMock.mockClear()
    mutateAsyncMock.mockClear()
    invalidateQueriesMock.mockClear()
    toastSuccessMock.mockClear()
    toastErrorMock.mockClear()
  })

  test("exposes mutation state and resolver function", async () => {
    const { useResolveReport } = await import(
      "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/hooks/useResolveReport"
    )
    const { result } = renderHook(() => useResolveReport())

    expect(typeof result.current.resolveReport).toBe("function")
    expect(result.current.isPending).toBe(false)

    await act(async () => {
      await result.current.resolveReport({
        reportId: "report-1",
        status: "resolved",
        resolutionNote: "Handled",
      })
    })

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      reportId: "report-1",
      status: "resolved",
      resolutionNote: "Handled",
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: [
        "companies",
        "listReports",
        { status: "open", limit: 12 },
      ],
    })
    expect(toastSuccessMock).toHaveBeenCalledWith("Report resolved successfully.")
  })
})
