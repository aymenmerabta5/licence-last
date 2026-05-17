import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"

const pushMock = mock(() => undefined)
const refreshMock = mock(() => undefined)
const stopImpersonatingMock = mock(async () => undefined)

mock.module("next-intl", () => ({
  useTranslations: () => (key: string, values?: { name?: string }) => {
    if (key === "banner") {
      return `You are impersonating ${values?.name ?? ""}`
    }

    if (key === "stop") {
      return "Stop"
    }

    return key
  },
}))

mock.module("@/i18n/routing", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}))

mock.module("@/lib/auth-client", () => ({
  authClient: {
    admin: {
      stopImpersonating: stopImpersonatingMock,
    },
  },
}))

mock.module("@/server/orpc/client", () => ({
  orpc: {
    users: {
      getMe: {
        queryOptions: () => ({ queryKey: ["users", "getMe"] }),
      },
    },
  },
}))

let importCounter = 0

async function loadImpersonationBanner() {
  importCounter += 1
  return import(`@/components/ImpersonationBanner?test=${importCounter}`)
}

describe("ImpersonationBanner", () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    pushMock.mockClear()
    refreshMock.mockClear()
    stopImpersonatingMock.mockClear()
  })

  test("resets the current user query before returning to super admin users", async () => {
    const resetQueriesMock = mock(async () => undefined)
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    queryClient.resetQueries =
      resetQueriesMock as typeof queryClient.resetQueries

    const { ImpersonationBanner } = await loadImpersonationBanner()

    render(
      <QueryClientProvider client={queryClient}>
        <ImpersonationBanner userName="amir" />
      </QueryClientProvider>,
    )

    fireEvent.click(screen.getByRole("button", { name: "Stop" }))

    await waitFor(() => {
      expect(stopImpersonatingMock).toHaveBeenCalledTimes(1)
      expect(resetQueriesMock).toHaveBeenCalledWith({
        queryKey: ["users", "getMe"],
      })
      expect(pushMock).toHaveBeenCalledWith("/dashboard/admin/users")
      expect(refreshMock).toHaveBeenCalledTimes(1)
    })
  })
})
