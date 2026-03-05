import { describe, expect, test } from "bun:test"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook } from "@testing-library/react"

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return Wrapper
}

describe.skip("useResolveReport", () => {
  test("exposes mutation state and resolver function", async () => {
    const { useResolveReport } = await import(
      "@/app/[locale]/(authenticated)/dashboard/admin/stats/_components/AdminStatsView/hooks/useResolveReport"
    )
    const wrapper = createWrapper()
    const { result } = renderHook(() => useResolveReport(), { wrapper })

    expect(typeof result.current.resolveReport).toBe("function")
    expect(result.current.isPending).toBe(false)
  })
})
