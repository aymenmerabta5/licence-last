import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockInsert = mock(() => ({}) as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockValues = mock((): any => Promise.resolve())
const getNotificationPreferencesMock = mock(async () => ({
  inAppEnabled: true,
  emailEnabled: true,
}))
const createNotificationMock = mock(async () => ({
  id: "notification-1",
  skipped: false,
}))
const sendEmailMock = mock(async () => ({ success: true }))

mock.module("@/server/db", () => ({
  db: {
    insert: mockInsert,
  },
}))

mock.module("@/server/services/notifications/get-preferences", () => ({
  getNotificationPreferences: getNotificationPreferencesMock,
}))

mock.module("@/server/services/notifications/create", () => ({
  createNotification: createNotificationMock,
}))

mock.module("@/server/email/sendEmail", () => ({
  sendEmail: sendEmailMock,
}))

describe("src/server/services/notifications/emit", () => {
  beforeEach(() => {
    mockInsert.mockClear()
    mockValues.mockClear()
    getNotificationPreferencesMock.mockClear()
    createNotificationMock.mockClear()
    sendEmailMock.mockClear()

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
    getNotificationPreferencesMock.mockResolvedValue({
      inAppEnabled: true,
      emailEnabled: true,
    })
    createNotificationMock.mockResolvedValue({
      id: "notification-1",
      skipped: false,
    })
    sendEmailMock.mockResolvedValue({ success: true })
  })

  test("creates in-app notification without email when no email input is provided", async () => {
    const { emitNotification } = await import(
      "@/server/services/notifications/emit?fresh=1" as string
    )

    const result = await emitNotification({
      userId: "user-1",
      type: "company_approved",
      payload: { companyId: "company-1" },
    })

    expect(getNotificationPreferencesMock).toHaveBeenCalledTimes(1)
    expect(createNotificationMock).toHaveBeenCalledTimes(1)
    expect(sendEmailMock).not.toHaveBeenCalled()
    expect(result).toEqual({
      notificationId: "notification-1",
      inAppSkipped: false,
      emailAttempted: false,
      emailSkipped: false,
      emailSuccess: null,
    })
  })

  test("skips email when email notifications are disabled", async () => {
    getNotificationPreferencesMock.mockResolvedValueOnce({
      inAppEnabled: true,
      emailEnabled: false,
    })

    const { emitNotification } = await import(
      "@/server/services/notifications/emit?fresh=2" as string
    )

    const result = await emitNotification({
      userId: "user-2",
      type: "company_approved",
      payload: { companyId: "company-2" },
      email: {
        to: "user2@example.com",
        subject: "Company approved",
        component: () => null,
        props: {},
      },
    })

    expect(createNotificationMock).toHaveBeenCalledTimes(1)
    expect(sendEmailMock).not.toHaveBeenCalled()
    expect(result.emailSkipped).toBe(true)
    expect(result.emailSuccess).toBe(null)
  })

  test("sends email when email notifications are enabled", async () => {
    const { emitNotification } = await import(
      "@/server/services/notifications/emit?fresh=3" as string
    )

    const result = await emitNotification({
      userId: "user-3",
      type: "university_approved",
      payload: { universityId: "uni-1" },
      email: {
        to: "user3@example.com",
        subject: "University approved",
        component: () => null,
        props: {},
      },
    })

    expect(sendEmailMock).toHaveBeenCalledTimes(1)
    expect(result.emailAttempted).toBe(true)
    expect(result.emailSuccess).toBe(true)
  })
})
