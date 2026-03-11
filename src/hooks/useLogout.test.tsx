import type { ReactNode } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, mock, test } from "bun:test"

import { useLogout } from "@/hooks/useLogout"

const replaceMock = mock(() => {})
const signOutMock = mock(
  async (options?: { fetchOptions?: { onSuccess?: () => void } }) => {
    options?.fetchOptions?.onSuccess?.()
  },
)

mock.module("@/i18n/routing", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}))

mock.module("@/lib/auth-client", () => ({
  authClient: {
    signOut: signOutMock,
  },
}))

describe("src/hooks/useLogout", () => {
  beforeEach(() => {
    replaceMock.mockClear()
    signOutMock.mockClear()
  })

  test("clears query cache and redirects on successful logout", async () => {
    const queryClient = new QueryClient()
    const clearMock = mock(() => undefined)
    queryClient.clear = clearMock as typeof queryClient.clear

    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    }

    const { result } = renderHook(() => useLogout(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.logout()
    })

    expect(signOutMock).toHaveBeenCalledTimes(1)
    expect(clearMock).toHaveBeenCalledTimes(1)
    expect(replaceMock).toHaveBeenCalledWith("/")
    expect(result.current.isLoggingOut).toBe(false)
  })
})
