import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"

const setQueryDataMock = mock(() => {})
const mutateAsyncMock = mock(async () => {})

const queryState = {
  data: { inAppEnabled: true, emailEnabled: true },
  isError: false,
  error: null as unknown,
}

const notificationsEnabledState = { value: true }

mock.module("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    setQueryData: setQueryDataMock,
  }),
  useQuery: () => queryState,
  useMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}))

mock.module("@/lib/feature-flags-client", () => ({
  isNotificationPreferencesEnabledOnClient: () =>
    notificationsEnabledState.value,
}))

mock.module("@/server/orpc/client", () => ({
  orpc: {
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
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
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
