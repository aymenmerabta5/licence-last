import { beforeEach, describe, expect, mock, test } from "bun:test"

import { ServiceError } from "@/server/services/errors"

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

const createFieldMock = mock(async () => ({ fieldId: "field-1" }))
const listFieldsMock = mock(async () => ({ fields: [], hasMore: false }))
const getFieldMock = mock(async () => ({
  id: "field-1",
  name: "Computer Science",
  slug: "computer-science",
  description: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
}))
const updateFieldMock = mock(async () => ({
  id: "field-1",
  name: "Updated Name",
  slug: "updated-name",
  description: null,
}))
const deleteFieldMock = mock(async () => ({ success: true, fieldId: "field-1" }))
const syncFieldSkillsMock = mock(async () => ({ fieldId: "field-1", skillCount: 2 }))
const getFieldSkillIdsMock = mock(async () => ["skill-1", "skill-2"])

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  publicProcedureStandard: createProcedureMock(),
  adminProcedureStandard: createProcedureMock(),
}))

mock.module("@/server/services/fields/create", () => ({
  createField: createFieldMock,
}))
mock.module("@/server/services/fields/list", () => ({
  listFields: listFieldsMock,
}))
mock.module("@/server/services/fields/get", () => ({
  getField: getFieldMock,
}))
mock.module("@/server/services/fields/update", () => ({
  updateField: updateFieldMock,
}))
mock.module("@/server/services/fields/delete", () => ({
  deleteField: deleteFieldMock,
}))
mock.module("@/server/services/fields/sync-skills", () => ({
  syncFieldSkills: syncFieldSkillsMock,
}))
mock.module("@/server/services/fields/get-skills", () => ({
  getFieldSkillIds: getFieldSkillIdsMock,
}))

describe("src/server/orpc/routes/fields", () => {
  beforeEach(() => {
    createFieldMock.mockClear()
    listFieldsMock.mockClear()
    getFieldMock.mockClear()
    updateFieldMock.mockClear()
    deleteFieldMock.mockClear()
    syncFieldSkillsMock.mockClear()
    getFieldSkillIdsMock.mockClear()
  })

  test("listFieldsProcedure delegates to listFields", async () => {
    const { listFieldsProcedure } = await import(
      "@/server/orpc/routes/fields"
    )

    const result = await callProcedure(listFieldsProcedure, {})

    expect(result).toEqual({ fields: [], hasMore: false })
    expect(listFieldsMock).toHaveBeenCalledWith()
  })

  test("getFieldProcedure delegates with fieldId", async () => {
    const { getFieldProcedure } = await import("@/server/orpc/routes/fields")

    const result = await callProcedure(getFieldProcedure, {
      input: { fieldId: "field-1" },
    })

    expect(result).toEqual({
      id: "field-1",
      name: "Computer Science",
      slug: "computer-science",
      description: null,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    })
    expect(getFieldMock).toHaveBeenCalledWith("field-1")
  })

  test("createFieldProcedure delegates with name and description", async () => {
    const { createFieldProcedure } = await import(
      "@/server/orpc/routes/fields"
    )

    const result = await callProcedure(createFieldProcedure, {
      input: { name: "Computer Science", description: "CS field" },
    })

    expect(result).toEqual({ fieldId: "field-1" })
    expect(createFieldMock).toHaveBeenCalledWith("Computer Science", "CS field")
  })

  test("createFieldProcedure maps duplicate-name service errors", async () => {
    createFieldMock.mockRejectedValueOnce(
      new ServiceError(
        "FIELD_NAME_EXISTS",
        "A field with this name already exists",
      ),
    )
    const { createFieldProcedure } = await import(
      "@/server/orpc/routes/fields"
    )

    await expect(
      callProcedure(createFieldProcedure, {
        input: { name: "Computer Science" },
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: "A field with this name already exists",
    })
  })

  test("updateFieldProcedure delegates with fieldId, name and description", async () => {
    const { updateFieldProcedure } = await import(
      "@/server/orpc/routes/fields"
    )

    const result = await callProcedure(updateFieldProcedure, {
      input: {
        fieldId: "field-1",
        name: "Updated Name",
        description: "Updated description",
      },
    })

    expect(result).toEqual({
      id: "field-1",
      name: "Updated Name",
      slug: "updated-name",
      description: null,
    })
    expect(updateFieldMock).toHaveBeenCalledWith("field-1", {
      name: "Updated Name",
      description: "Updated description",
    })
  })

  test("updateFieldProcedure maps not-found service errors", async () => {
    updateFieldMock.mockRejectedValueOnce(
      new ServiceError("FIELD_NOT_FOUND", "Field not found"),
    )
    const { updateFieldProcedure } = await import(
      "@/server/orpc/routes/fields"
    )

    await expect(
      callProcedure(updateFieldProcedure, {
        input: { fieldId: "missing", name: "New Name" },
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Field not found",
    })
  })

  test("deleteFieldProcedure delegates with fieldId", async () => {
    const { deleteFieldProcedure } = await import(
      "@/server/orpc/routes/fields"
    )

    const result = await callProcedure(deleteFieldProcedure, {
      input: { fieldId: "field-1" },
    })

    expect(result).toEqual({ success: true, fieldId: "field-1" })
    expect(deleteFieldMock).toHaveBeenCalledWith("field-1")
  })

  test("deleteFieldProcedure maps in-use service errors", async () => {
    deleteFieldMock.mockRejectedValueOnce(
      new ServiceError(
        "FIELD_IN_USE",
        "Cannot delete field that is assigned to departments",
      ),
    )
    const { deleteFieldProcedure } = await import(
      "@/server/orpc/routes/fields"
    )

    await expect(
      callProcedure(deleteFieldProcedure, {
        input: { fieldId: "field-1" },
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Cannot delete field that is assigned to departments",
    })
  })

  test("syncFieldSkillsProcedure delegates with fieldId and skills", async () => {
    const { syncFieldSkillsProcedure } = await import(
      "@/server/orpc/routes/fields"
    )

    const skills = [
      { skillTagId: "skill-1", isCore: true },
      { skillTagId: "skill-2", isCore: false },
    ]
    const result = await callProcedure(syncFieldSkillsProcedure, {
      input: { fieldId: "field-1", skills },
    })

    expect(result).toEqual({ fieldId: "field-1", skillCount: 2 })
    expect(syncFieldSkillsMock).toHaveBeenCalledWith("field-1", skills)
  })

  test("syncFieldSkillsProcedure maps invalid skill ids to bad request", async () => {
    syncFieldSkillsMock.mockRejectedValueOnce(
      new ServiceError(
        "INVALID_SKILL_TAG_IDS",
        "Invalid skill tag IDs: stale-skill",
      ),
    )
    const { syncFieldSkillsProcedure } = await import(
      "@/server/orpc/routes/fields"
    )

    await expect(
      callProcedure(syncFieldSkillsProcedure, {
        input: {
          fieldId: "field-1",
          skills: [{ skillTagId: "stale-skill" }],
        },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Invalid skill tag IDs: stale-skill",
    })
  })

  test("getFieldSkillsProcedure delegates with fieldId", async () => {
    const { getFieldSkillsProcedure } = await import(
      "@/server/orpc/routes/fields"
    )

    const result = await callProcedure(getFieldSkillsProcedure, {
      input: { fieldId: "field-1" },
    })

    expect(result).toEqual(["skill-1", "skill-2"])
    expect(getFieldSkillIdsMock).toHaveBeenCalledWith("field-1")
  })
})
