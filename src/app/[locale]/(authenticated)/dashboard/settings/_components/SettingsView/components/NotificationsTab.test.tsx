import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from "bun:test"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"

const setQueryDataMock = mock(() => {})
const mutateAsyncMock = mock(async () => {})

const queryState = {
  data: { inAppEnabled: true, emailEnabled: true },
  isError: false,
  error: null as unknown,
}

const notificationsEnabledState = { value: true }

function applyReactQueryMock() {
  mock.module("@tanstack/react-query", () => ({
    QueryClient: class QueryClient {
      constructor(public options?: unknown) {}
    },
    QueryClientProvider: ({
      children,
    }: {
      children: React.ReactNode
      client: unknown
    }) => <>{children}</>,
    useQueryClient: () => ({
      setQueryData: setQueryDataMock,
    }),
    useQuery: (options?: {
      enabled?: boolean
      queryFn?: () => Promise<unknown>
      queryKey?: unknown[]
    }) => {
      const queryKey = Array.isArray(options?.queryKey)
        ? options.queryKey[0]
        : null
      const isNotificationsQuery = queryKey === "notifications"

      const [data, setData] = React.useState<unknown>(undefined)
      const [isLoading, setIsLoading] = React.useState(
        Boolean(options?.enabled !== false),
      )
      const queryFnRef = React.useRef(options?.queryFn)
      queryFnRef.current = options?.queryFn

      React.useEffect(() => {
        let isActive = true

        if (isNotificationsQuery) {
          setIsLoading(false)
          return () => {
            isActive = false
          }
        }

        if (options?.enabled === false || !queryFnRef.current) {
          setIsLoading((current) => (current ? false : current))
          return () => {
            isActive = false
          }
        }

        setIsLoading((current) => (current ? current : true))

        Promise.resolve(queryFnRef.current()).then((result) => {
          if (!isActive) {
            return
          }

          setData(result)
          setIsLoading(false)
        })

        return () => {
          isActive = false
        }
      }, [isNotificationsQuery, options?.enabled])

      if (isNotificationsQuery) {
        return queryState
      }

      return { data, isLoading }
    },
    useMutation: () => ({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    }),
  }))
}

mock.module("@/lib/feature-flags-client", () => ({
  isNotificationPreferencesEnabledOnClient: () =>
    notificationsEnabledState.value,
}))

mock.module("@/server/orpc/client", () => ({
  orpcClient: {},
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
    notifications: {
      getPreferences: {
        queryOptions: () => ({ queryKey: ["notifications", "preferences"] }),
      },
      updatePreferences: {
        mutationOptions: () => ({}),
      },
    },
  },
}))

mock.module("@/components/ui/checkbox", () => ({
  Checkbox: ({
    checked,
    onCheckedChange,
    "aria-label": ariaLabel,
    disabled,
  }: {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
    "aria-label"?: string
    disabled?: boolean
  }) => (
    <input
      type="checkbox"
      aria-label={ariaLabel}
      checked={Boolean(checked)}
      disabled={disabled}
      onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
    />
  ),
}))

describe("NotificationsTab", () => {
  afterAll(() => {
    mock.restore()
  })

  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    applyReactQueryMock()
    setQueryDataMock.mockClear()
    mutateAsyncMock.mockClear()
    queryState.data = { inAppEnabled: true, emailEnabled: true }
    queryState.isError = false
    queryState.error = null
    notificationsEnabledState.value = true
  })

  test("renders interactive preferences when feature flag is enabled", async () => {
    const { NotificationsTab } = await import(
      "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView/components/NotificationsTab"
    )

    render(<NotificationsTab email="qa@example.com" />)

    expect(screen.getByLabelText("Toggle in-app notifications")).toBeTruthy()
    expect(screen.getByLabelText("Toggle email notifications")).toBeTruthy()
    expect(screen.queryByText("Soon")).toBeNull()
  })

  test("renders fallback state when feature flag is disabled", async () => {
    const { NotificationsTab } = await import(
      "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView/components/NotificationsTab"
    )

    notificationsEnabledState.value = false
    render(<NotificationsTab email="qa@example.com" />)

    expect(screen.getByText("Soon")).toBeTruthy()
    expect(screen.getByText(/Email notifications are active/i)).toBeTruthy()
    expect(screen.queryByLabelText("Toggle in-app notifications")).toBeNull()
    expect(screen.queryByLabelText("Toggle email notifications")).toBeNull()
  })

  test("updates preference when toggled in enabled mode", async () => {
    const { NotificationsTab } = await import(
      "@/app/[locale]/(authenticated)/dashboard/settings/_components/SettingsView/components/NotificationsTab"
    )

    render(<NotificationsTab email="qa@example.com" />)

    fireEvent.click(screen.getByLabelText("Toggle in-app notifications"))

    expect(mutateAsyncMock).toHaveBeenCalledTimes(1)
  })
})
