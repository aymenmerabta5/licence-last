import { beforeEach, describe, expect, mock, test } from "bun:test"

interface FieldRow {
  id: string
  name: string
  slug: string
  description: string | null
  skillCount: number
}

const mockResult: FieldRow[] = []

const mockOffset = mock(() => Promise.resolve(mockResult))
const mockLimit = mock(() => ({ offset: mockOffset }))
const mockOrderBy = mock(() => ({ limit: mockLimit }))
const mockWhere = mock(() => ({ orderBy: mockOrderBy }))
const mockFrom = mock(() => ({ where: mockWhere, orderBy: mockOrderBy }))
const mockSelect = mock(() => ({ from: mockFrom }))

function applyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
    },
  }))
}

let moduleImportCounter = 0
async function importListFields() {
  moduleImportCounter += 1
  return import(`@/server/services/fields/list?test=${moduleImportCounter}`)
}

describe("src/server/services/fields/list", () => {
  beforeEach(() => {
    applyMocks()

    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockOrderBy.mockClear()
    mockLimit.mockClear()
    mockOffset.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy })
    mockWhere.mockReturnValue({ orderBy: mockOrderBy })
    mockOrderBy.mockReturnValue({ limit: mockLimit })
    mockLimit.mockReturnValue({ offset: mockOffset })
    mockOffset.mockResolvedValue([])
  })

  test("should return all fields with skillCount", async () => {
    const fields: FieldRow[] = [
      {
        id: "1",
        name: "Computer Science",
        slug: "computer-science",
        description: null,
        skillCount: 3,
      },
      {
        id: "2",
        name: "Mathematics",
        slug: "mathematics",
        description: "Math field",
        skillCount: 0,
      },
    ]
    mockOffset.mockResolvedValue(fields)

    const { listFields } = await importListFields()
    const result = await listFields()

    expect(result.fields).toEqual(fields)
    expect(result.hasMore).toBe(false)
    expect(mockSelect).toHaveBeenCalled()
    expect(mockFrom).toHaveBeenCalled()
  })

  test("should respect limit and hasMore", async () => {
    const fields: FieldRow[] = [
      { id: "1", name: "A", slug: "a", description: null, skillCount: 1 },
      { id: "2", name: "B", slug: "b", description: null, skillCount: 2 },
      { id: "3", name: "C", slug: "c", description: null, skillCount: 3 },
    ]
    mockOffset.mockResolvedValue(fields)

    const { listFields } = await importListFields()
    const result = await listFields({ limit: 2 })

    expect(result.fields).toHaveLength(2)
    expect(result.hasMore).toBe(true)
  })
})
