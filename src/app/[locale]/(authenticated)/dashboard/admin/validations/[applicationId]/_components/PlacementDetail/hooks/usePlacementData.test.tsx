import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"

const getPendingByIdQueryOptionsMock = mock(
  ({ input }: { input: { applicationId: string } }) => ({
    queryKey: ["placements", "getPendingById", input],
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
    orpcClient: {},
    orpc: {
      placements: {
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

describe("usePlacementData", () => {
  let importCounter = 0

  async function importUsePlacementData() {
    importCounter += 1
    return import(
      `@/app/[locale]/(authenticated)/dashboard/admin/validations/[applicationId]/_components/PlacementDetail/hooks/usePlacementData?test=${importCounter}`
    )
  }

  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    applyORPCClientMock()
    getPendingByIdQueryOptionsMock.mockClear()
  })

  test("should query the pending application directly by id", async () => {
    const { usePlacementData } = await importUsePlacementData()

    const { result } = renderHook(() => usePlacementData("app-42"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.application?.id).toBe("app-42")
    })

    expect(getPendingByIdQueryOptionsMock).toHaveBeenCalledWith({
      input: { applicationId: "app-42" },
    })
  })
})
