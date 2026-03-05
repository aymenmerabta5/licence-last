import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockReturningResult: any[] = []

const mockReturning = mock(() => Promise.resolve(mockReturningResult))
const mockWhere = mock(() => ({ returning: mockReturning }))
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))

function applyDbMock() {
  mock.module("@/server/db", () => ({
    db: {
      update: mockUpdate,
    },
  }))
}

let moduleNonce = 0

async function importUpdateMe() {
  moduleNonce += 1
  return import(`@/server/services/users/update-me?test=${moduleNonce}`)
}

describe("src/server/services/users/update-me", () => {
  beforeEach(() => {
    applyDbMock()
    mockReturningResult = []
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
  })

  test("should update user name and return updated data", async () => {
    mockReturningResult = [
      {
        id: "user-1",
        name: "New Name",
        email: "test@example.com",
        image: null,
      },
    ]

    const { updateMe } = await importUpdateMe()
    const result = await updateMe("user-1", { name: "New Name" })

    expect(result).toEqual({
      id: "user-1",
      name: "New Name",
      email: "test@example.com",
      image: null,
    })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should allow setting name to null", async () => {
    mockReturningResult = [
      { id: "user-1", name: null, email: "test@example.com", image: null },
    ]

    const { updateMe } = await importUpdateMe()
    const result = await updateMe("user-1", { name: null })

    expect(result.name).toBeNull()
  })

  test("should throw when user not found", async () => {
    mockReturningResult = []

    const { updateMe } = await importUpdateMe()

    await expect(updateMe("missing", { name: "Test" })).rejects.toThrow(
      "User not found",
    )
  })
})
