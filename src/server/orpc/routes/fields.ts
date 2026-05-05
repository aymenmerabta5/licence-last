import "server-only"

import { z } from "zod"

import {
  adminProcedureStandard,
  publicProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { createServiceORPCError } from "@/server/orpc/utils/service-error"
import { createField } from "@/server/services/fields/create"
import { deleteField } from "@/server/services/fields/delete"
import { getField } from "@/server/services/fields/get"
import { getFieldSkillIds } from "@/server/services/fields/get-skills"
import { listFields } from "@/server/services/fields/list"
import { syncFieldSkills } from "@/server/services/fields/sync-skills"
import { updateField } from "@/server/services/fields/update"

export const listFieldsProcedure = publicProcedureStandard
  .handler(async () => listFields())

export const getFieldProcedure = publicProcedureStandard
  .input(z.object({ fieldId: z.string().min(1) }))
  .handler(async ({ input }) => getField(input.fieldId))

export const createFieldProcedure = adminProcedureStandard
  .input(
    z.object({
      name: z.string().trim().min(1).max(200),
      description: z.string().trim().optional().nullable(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      return await createField(input.name, input.description)
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          FIELD_NAME_REQUIRED: "BAD_REQUEST",
          FIELD_NAME_TOO_LONG: "BAD_REQUEST",
          FIELD_NAME_EXISTS: "CONFLICT",
        },
        fallbackMessage: "Failed to create field",
      })
    }
  })

export const updateFieldProcedure = adminProcedureStandard
  .input(
    z.object({
      fieldId: z.string().min(1),
      name: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().optional().nullable().optional(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      return await updateField(input.fieldId, {
        name: input.name,
        description: input.description,
      })
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          FIELD_NAME_REQUIRED: "BAD_REQUEST",
          FIELD_NAME_TOO_LONG: "BAD_REQUEST",
          FIELD_NAME_EXISTS: "CONFLICT",
          FIELD_NOT_FOUND: "NOT_FOUND",
        },
        fallbackMessage: "Failed to update field",
      })
    }
  })

export const deleteFieldProcedure = adminProcedureStandard
  .input(z.object({ fieldId: z.string().min(1) }))
  .handler(async ({ input }) => {
    try {
      return await deleteField(input.fieldId)
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          FIELD_NOT_FOUND: "NOT_FOUND",
          FIELD_IN_USE: "CONFLICT",
        },
        fallbackMessage: "Failed to delete field",
      })
    }
  })

export const syncFieldSkillsProcedure = adminProcedureStandard
  .input(
    z.object({
      fieldId: z.string().min(1),
      skills: z
        .array(
          z.object({
            skillTagId: z.string().min(1),
            isCore: z.boolean().optional(),
          }),
        )
        .max(200),
    }),
  )
  .handler(async ({ input }) => {
    try {
      return await syncFieldSkills(input.fieldId, input.skills)
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          SKILL_LIMIT_EXCEEDED: "BAD_REQUEST",
          INVALID_SKILL_TAG_IDS: "BAD_REQUEST",
          FIELD_NOT_FOUND: "NOT_FOUND",
        },
        fallbackMessage: "Failed to sync field skills",
      })
    }
  })

export const getFieldSkillsProcedure = publicProcedureStandard
  .input(z.object({ fieldId: z.string().min(1) }))
  .handler(async ({ input }) => getFieldSkillIds(input.fieldId))
