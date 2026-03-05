import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let selectResponses: any[] = []

const mockLimit = mock(async () => selectResponses.shift() ?? [])
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

const mockTxInsertValues = mock(async () => undefined)
const mockTxInsert = mock(() => ({ values: mockTxInsertValues }))
const mockTxUpdateWhere = mock(async () => undefined)
const mockTxUpdateSet = mock(() => ({ where: mockTxUpdateWhere }))
const mockTxUpdate = mock(() => ({ set: mockTxUpdateSet }))
const mockTransaction = mock(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (fn: (tx: any) => Promise<void>) => {
    await fn({
      insert: mockTxInsert,
      update: mockTxUpdate,
    })
  },
)

const mockCreateUser = mock(async () => ({
  user: { id: "user-created" },
}))
const mockRequestPasswordReset = mock(async () => ({ ok: true }))
const mockCreateNotification = mock(async () => ({ id: "notif-1" }))

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
    transaction: mockTransaction,
  },
}))

mock.module("@/lib/auth", () => ({
  auth: {
    api: {
      createUser: mockCreateUser,
      requestPasswordReset: mockRequestPasswordReset,
    },
  },
}))

mock.module("@/server/services/notifications/create", () => ({
  createNotification: mockCreateNotification,
}))

describe("src/server/services/companies/invite-member", () => {
  beforeEach(() => {
    selectResponses = []

    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockTransaction.mockClear()
    mockTxInsert.mockClear()
    mockTxInsertValues.mockClear()
    mockTxUpdate.mockClear()
    mockTxUpdateSet.mockClear()
    mockTxUpdateWhere.mockClear()
    mockCreateUser.mockClear()
    mockRequestPasswordReset.mockClear()
    mockCreateNotification.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
  })

  test("creates a new account and sends reset link when email does not exist", async () => {
    selectResponses = [[{ id: "company-1", name: "Acme" }], []]

    const { inviteCompanyMember } = await import(
      "@/server/services/companies/invite-member?fresh=1"
    )
    const result = await inviteCompanyMember({
      companyId: "company-1",
      invitedByUserId: "owner-1",
      email: "new.member@example.com",
      name: "New Member",
    })

    expect(mockCreateUser).toHaveBeenCalledTimes(1)
    expect(mockRequestPasswordReset).toHaveBeenCalledWith({
      body: {
        email: "new.member@example.com",
        redirectTo: "/reset-password/verify",
      },
    })
    expect(result).toMatchObject({
      userId: "user-created",
      createdUser: true,
      alreadyMember: false,
      role: "recruiter",
    })
  })

  test("returns alreadyMember for existing same-company membership", async () => {
    selectResponses = [
      [{ id: "company-1", name: "Acme" }],
      [
        {
          id: "member-1",
          email: "member@example.com",
          name: "Member",
          role: "company_admin",
          onboardingCompleted: true,
        },
      ],
      [{ companyId: "company-1", role: "recruiter" }],
    ]

    const { inviteCompanyMember } = await import(
      "@/server/services/companies/invite-member?fresh=2"
    )
    const result = await inviteCompanyMember({
      companyId: "company-1",
      invitedByUserId: "owner-1",
      email: "member@example.com",
    })

    expect(result).toMatchObject({
      userId: "member-1",
      createdUser: false,
      alreadyMember: true,
      role: "recruiter",
    })
    expect(mockCreateUser).not.toHaveBeenCalled()
  })

  test("throws conflict when user belongs to another company", async () => {
    selectResponses = [
      [{ id: "company-1", name: "Acme" }],
      [
        {
          id: "member-2",
          email: "member2@example.com",
          name: "Member",
          role: "company_admin",
          onboardingCompleted: true,
        },
      ],
      [{ companyId: "company-2", role: "owner" }],
    ]

    const { inviteCompanyMember } = await import(
      "@/server/services/companies/invite-member?fresh=3"
    )

    await expect(
      inviteCompanyMember({
        companyId: "company-1",
        invitedByUserId: "owner-1",
        email: "member2@example.com",
      }),
    ).rejects.toMatchObject({
      code: "COMPANY_MEMBER_ALREADY_ASSIGNED",
    })
  })

  test("rejects self invites", async () => {
    selectResponses = [
      [{ id: "company-1", name: "Acme" }],
      [
        {
          id: "owner-1",
          email: "owner@example.com",
          name: "Owner",
          role: "company_admin",
          onboardingCompleted: true,
        },
      ],
    ]

    const { inviteCompanyMember } = await import(
      "@/server/services/companies/invite-member?fresh=4"
    )

    await expect(
      inviteCompanyMember({
        companyId: "company-1",
        invitedByUserId: "owner-1",
        email: "owner@example.com",
      }),
    ).rejects.toMatchObject({
      code: "COMPANY_MEMBER_CANNOT_INVITE_SELF",
    })
  })

  afterAll(() => {
    mock.restore()
  })
})

