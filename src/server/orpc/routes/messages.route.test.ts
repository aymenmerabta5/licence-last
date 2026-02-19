import { beforeEach, describe, expect, mock, test } from "bun:test"

function createProcedureMock() {
  return {
    use() {
      return this
    },
    input() {
      return this
    },
    handler<T>(fn: T) {
      return fn
    },
  }
}

async function callProcedure<T>(procedure: unknown, args: unknown): Promise<T> {
  return (procedure as (input: unknown) => Promise<T>)(args)
}

const listMessageThreadsByCompanyMock = mock(async () => ({ threads: [] }))
const listMessageThreadsByStudentMock = mock(async () => ({ threads: [] }))
const listThreadMessagesMock = mock(async () => ({ messages: [] }))
const sendOfferMessageByCompanyMock = mock(async () => ({ messageId: "m1" }))
const sendOfferMessageByStudentMock = mock(async () => ({ messageId: "m2" }))
const markThreadReadMock = mock(async () => ({ unreadCount: 0 }))
let membershipRows: Array<{ companyId: string }> = []

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  authedProcedureGenerous: createProcedureMock(),
  authedProcedureStandard: createProcedureMock(),
  authedProcedureStrict: createProcedureMock(),
  authedSessionProcedureStandard: createProcedureMock(),
  authedSessionProcedureGenerous: createProcedureMock(),
  publicProcedureStrict: createProcedureMock(),
  publicProcedureStandard: createProcedureMock(),
  adminProcedureGenerous: createProcedureMock(),
  adminProcedureStandard: createProcedureMock(),
  adminProcedureAssistant: createProcedureMock(),
  superAdminProcedureGenerous: createProcedureMock(),
  superAdminProcedureStandard: createProcedureMock(),
  assistantProcedureLimited: createProcedureMock(),
  companyAdminProcedureGenerous: createProcedureMock(),
  companyAdminProcedureStandard: createProcedureMock(),
  companyAdminProcedureAssistant: createProcedureMock(),
  studentProcedureGenerous: createProcedureMock(),
  studentProcedureStandard: createProcedureMock(),
  deptHeadProcedureStandard: createProcedureMock(),
  deptHeadProcedureGenerous: createProcedureMock(),
}))
mock.module("@/server/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => membershipRows,
        }),
      }),
    }),
  },
}))
mock.module("@/server/services/messages/list-threads-by-company", () => ({
  listMessageThreadsByCompany: listMessageThreadsByCompanyMock,
}))
mock.module("@/server/services/messages/list-threads-by-student", () => ({
  listMessageThreadsByStudent: listMessageThreadsByStudentMock,
}))
mock.module("@/server/services/messages/list-thread-messages", () => ({
  listThreadMessages: listThreadMessagesMock,
}))
mock.module("@/server/services/messages/send-by-company", () => ({
  sendOfferMessageByCompany: sendOfferMessageByCompanyMock,
}))
mock.module("@/server/services/messages/send-by-student", () => ({
  sendOfferMessageByStudent: sendOfferMessageByStudentMock,
}))
mock.module("@/server/services/messages/mark-thread-read", () => ({
  markThreadRead: markThreadReadMock,
}))

describe("src/server/orpc/routes/messages", () => {
  beforeEach(() => {
    membershipRows = []
    listMessageThreadsByCompanyMock.mockClear()
    listMessageThreadsByStudentMock.mockClear()
    listThreadMessagesMock.mockClear()
    sendOfferMessageByCompanyMock.mockClear()
    sendOfferMessageByStudentMock.mockClear()
    markThreadReadMock.mockClear()
  })

  test("listMessageThreadsByCompanyProcedure delegates with membership company id", async () => {
    const { listMessageThreadsByCompanyProcedure } = await import(
      "@/server/orpc/routes/messages"
    )

    const input = { limit: 10 }
    const result = await callProcedure(listMessageThreadsByCompanyProcedure, {
      input,
      context: { companyMembership: { companyId: "company-1" } },
    })

    expect(result).toEqual({ threads: [] })
    expect(listMessageThreadsByCompanyMock).toHaveBeenCalledWith(
      "company-1",
      input,
    )
  })

  test("listThreadMessagesProcedure delegates for student context", async () => {
    const { listThreadMessagesProcedure } = await import(
      "@/server/orpc/routes/messages"
    )

    const result = await callProcedure(listThreadMessagesProcedure, {
      input: { threadId: "thread-1" },
      context: { user: { id: "student-1", role: "student" } },
    })

    expect(result).toEqual({ messages: [] })
    expect(listThreadMessagesMock).toHaveBeenCalledWith("thread-1", {
      userId: "student-1",
      role: "student",
    })
  })

  test("markThreadReadProcedure rejects company admin without membership", async () => {
    const { markThreadReadProcedure } = await import(
      "@/server/orpc/routes/messages"
    )

    await expect(
      callProcedure(markThreadReadProcedure, {
        input: { threadId: "thread-1" },
        context: { user: { id: "company-user-1", role: "company_admin" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: "No company membership found",
    })
  })
})
