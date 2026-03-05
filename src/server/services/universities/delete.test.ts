import { beforeEach, describe, expect, mock, test } from "bun:test"

const dbLimitMock = mock(async () => [{ id: "uni-1" }])
const dbWhereMock = mock(() => ({ limit: dbLimitMock }))
const dbFromMock = mock(() => ({ where: dbWhereMock }))
const dbSelectMock = mock(() => ({ from: dbFromMock }))

const txSelectWhereMock = mock(async () => [
  { userId: "user-1" },
  { userId: "user-2" },
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

function applyDeleteUniversityMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: dbSelectMock,
      transaction: transactionMock,
    },
  }))
}

let deleteUniversityImportCounter = 0
async function importDeleteUniversity() {
  deleteUniversityImportCounter += 1
  return import(
    `@/server/services/universities/delete?test=${deleteUniversityImportCounter}`
  )
}

describe("deleteUniversity", () => {
  beforeEach(() => {
    applyDeleteUniversityMocks()

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
    dbLimitMock.mockResolvedValue([{ id: "uni-1" }])

    txSelectMock.mockReturnValue({ from: txSelectFromMock })
    txSelectFromMock.mockReturnValue({ where: txSelectWhereMock })
    txSelectWhereMock.mockResolvedValue([
      { userId: "user-1" },
      { userId: "user-2" },
    ])

    txUpdateMock.mockReturnValue({ set: txUpdateSetMock })
    txUpdateSetMock.mockReturnValue({ where: txUpdateWhereMock })
    txUpdateWhereMock.mockResolvedValue(undefined)

    txDeleteMock.mockReturnValue({ where: txDeleteWhereMock })
    txDeleteWhereMock.mockResolvedValue(undefined)

    transactionMock.mockImplementation(async (fn) => fn(tx))
  })

  test("should delete university and return affected users", async () => {
    const { deleteUniversity } = await importDeleteUniversity()

    const result = await deleteUniversity("uni-1")

    expect(result).toEqual({
      success: true,
      universityId: "uni-1",
      affectedUserIds: ["user-1", "user-2"],
    })
  })

  test("should cleanup linked users in a transaction", async () => {
    const { deleteUniversity } = await importDeleteUniversity()

    await deleteUniversity("uni-1")

    expect(transactionMock).toHaveBeenCalledTimes(1)
    expect(txUpdateMock).toHaveBeenCalledTimes(2)
    expect(txDeleteMock).toHaveBeenCalledTimes(1)
  })

  test("should throw when university is not found", async () => {
    dbLimitMock.mockResolvedValue([])

    const { deleteUniversity } = await importDeleteUniversity()

    await expect(deleteUniversity("missing")).rejects.toThrow(
      "University not found",
    )
    expect(transactionMock).not.toHaveBeenCalled()
  })
})
