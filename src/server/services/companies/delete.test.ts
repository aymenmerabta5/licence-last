import { beforeEach, describe, expect, mock, test } from "bun:test"

const dbLimitMock = mock(async () => [{ id: "company-1", name: "ACME" }])
const dbWhereMock = mock(() => ({ limit: dbLimitMock }))
const dbFromMock = mock(() => ({ where: dbWhereMock }))
const dbSelectMock = mock(() => ({ from: dbFromMock }))

const txSelectWhereMock = mock(async () => [
  { userId: "owner-1" },
  { userId: "recruiter-1" },
])
const txSelectFromMock = mock(() => ({ where: txSelectWhereMock }))
const txSelectMock = mock(() => ({ from: txSelectFromMock }))

const txUpdateWhereMock = mock(async () => {})
const txUpdateSetMock = mock(() => ({ where: txUpdateWhereMock }))
const txUpdateMock = mock(() => ({ set: txUpdateSetMock }))

const txDeleteWhereMock = mock(async () => {})
const txDeleteMock = mock(() => ({ where: txDeleteWhereMock }))

const tx = {
  select: txSelectMock,
  update: txUpdateMock,
  delete: txDeleteMock,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transactionMock = mock(async (fn: (trx: any) => Promise<any>) => fn(tx))

mock.module("@/server/db", () => ({
  db: {
    select: dbSelectMock,
    transaction: transactionMock,
  },
}))

describe("deleteCompany", () => {
  beforeEach(() => {
    dbSelectMock.mockClear()
    dbFromMock.mockClear()
    dbWhereMock.mockClear()
    dbLimitMock.mockClear()

    txSelectMock.mockClear()
    txSelectFromMock.mockClear()
    txSelectWhereMock.mockClear()
    txUpdateMock.mockClear()
    txUpdateSetMock.mockClear()
    txUpdateWhereMock.mockClear()
    txDeleteMock.mockClear()
    txDeleteWhereMock.mockClear()
    transactionMock.mockClear()

    dbSelectMock.mockReturnValue({ from: dbFromMock })
    dbFromMock.mockReturnValue({ where: dbWhereMock })
    dbWhereMock.mockReturnValue({ limit: dbLimitMock })
    dbLimitMock.mockResolvedValue([{ id: "company-1", name: "ACME" }])

    txSelectMock.mockReturnValue({ from: txSelectFromMock })
    txSelectFromMock.mockReturnValue({ where: txSelectWhereMock })
    txSelectWhereMock.mockResolvedValue([
      { userId: "owner-1" },
      { userId: "recruiter-1" },
    ])

    txUpdateMock.mockReturnValue({ set: txUpdateSetMock })
    txUpdateSetMock.mockReturnValue({ where: txUpdateWhereMock })
    txUpdateWhereMock.mockResolvedValue(undefined)

    txDeleteMock.mockReturnValue({ where: txDeleteWhereMock })
    txDeleteWhereMock.mockResolvedValue(undefined)

    transactionMock.mockImplementation(async (fn) => fn(tx))
  })

  test("should delete company and return affected users", async () => {
    const modulePath = "@/server/services/companies/delete?fresh=1"
    const { deleteCompany } = await import(modulePath)

    const result = await deleteCompany("company-1", "super-admin-1")

    expect(result).toEqual({
      success: true,
      companyId: "company-1",
      companyName: "ACME",
      affectedUserIds: ["owner-1", "recruiter-1"],
    })
  })

  test("should reset linked users onboarding state and delete in a transaction", async () => {
    const modulePath = "@/server/services/companies/delete?fresh=2"
    const { deleteCompany } = await import(modulePath)

    await deleteCompany("company-1", "super-admin-1")

    expect(transactionMock).toHaveBeenCalledTimes(1)
    expect(txUpdateMock).toHaveBeenCalledTimes(1)
    expect(txDeleteMock).toHaveBeenCalledTimes(1)
  })

  test("should throw when company is not found", async () => {
    dbLimitMock.mockResolvedValue([])

    const modulePath = "@/server/services/companies/delete?fresh=3"
    const { deleteCompany } = await import(modulePath)

    await expect(deleteCompany("missing", "super-admin-1")).rejects.toThrow(
      "Company not found",
    )
    expect(transactionMock).not.toHaveBeenCalled()
  })
})
