import { beforeEach, describe, expect, mock, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"

import { useLogout } from "@/hooks/useLogout"

const replaceMock = mock(() => {})
const currentQueryClient = {
  clear: mock(() => undefined),
}

mock.module("@tanstack/react-query", () => ({
  useQueryClient: () => currentQueryClient,
}))

const signOutMock = mock(
  async (options?: { fetchOptions?: { onSuccess?: () => void } }) => {
    options?.fetchOptions?.onSuccess?.()
  },
)

mock.module("@/i18n/routing", () => ({
  Link: ({ children }: { children?: unknown }) => <>{children}</>,
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
    currentQueryClient.clear.mockClear()

    const { result } = renderHook(() => useLogout())

    await act(async () => {
      await result.current.logout()
    })

    expect(signOutMock).toHaveBeenCalledTimes(1)
    expect(currentQueryClient.clear).toHaveBeenCalledTimes(1)
    expect(replaceMock).toHaveBeenCalledWith("/")
    expect(result.current.isLoggingOut).toBe(false)
  })
})
