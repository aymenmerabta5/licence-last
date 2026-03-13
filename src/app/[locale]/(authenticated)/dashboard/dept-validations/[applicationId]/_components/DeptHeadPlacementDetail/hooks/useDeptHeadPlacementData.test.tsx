import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"

const getPendingByIdQueryOptionsMock = mock(
  ({ input }: { input: { applicationId: string } }) => ({
    queryKey: ["deptHead", "getPendingById", input],
    queryFn: async () => ({
      application: {
        id: input.applicationId,
        student: { name: "Student One" },
      },
    }),
  }),
)

function applyORPCClientMock() {
  mock.module("@/server/orpc/client", () => ({
    orpc: {
      deptHead: {
        getPendingById: {
          queryOptions: getPendingByIdQueryOptionsMock,
        },
      },
    },
  }))
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe("useDeptHeadPlacementData", () => {
  let importCounter = 0

  async function importUseDeptHeadPlacementData() {
    importCounter += 1
    return import(
      `@/app/[locale]/(authenticated)/dashboard/dept-validations/[applicationId]/_components/DeptHeadPlacementDetail/hooks/useDeptHeadPlacementData?test=${importCounter}`
    )
  }

  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    applyORPCClientMock()
    getPendingByIdQueryOptionsMock.mockClear()
  })

  test("should query the dept-head pending application directly by id", async () => {
    const { useDeptHeadPlacementData } = await importUseDeptHeadPlacementData()

    const { result } = renderHook(
      () => useDeptHeadPlacementData("app-42"),
      {
        wrapper: createWrapper(),
      },
    )

    await waitFor(() => {
      expect(result.current.application?.id).toBe("app-42")
    })

    expect(getPendingByIdQueryOptionsMock).toHaveBeenCalledWith({
      input: { applicationId: "app-42" },
    })
  })
})
