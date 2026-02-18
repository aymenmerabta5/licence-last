import "server-only"

import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { randomUUID } from "node:crypto"

import {
  studentProcedureGenerous,
  studentProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { parseInputDate } from "@/server/orpc/utils/date"
import { createServiceORPCError } from "@/server/orpc/utils/service-error"
import { uploadFile } from "@/server/storage/s3"
import { createStudentExperience } from "@/server/services/students/create-experience"
import { createStudentProject } from "@/server/services/students/create-project"
import { deleteStudentExperience } from "@/server/services/students/delete-experience"
import { deleteStudentProject } from "@/server/services/students/delete-project"
import { deleteStudentResume } from "@/server/services/students/delete-resume"
import { getStudentCv } from "@/server/services/students/get-cv"
import {
  isStudentCvServiceError,
  StudentCvServiceError,
} from "@/server/services/students/cv-errors"
import { updateStudentExperience } from "@/server/services/students/update-experience"
import { updateStudentProject } from "@/server/services/students/update-project"
import { upsertStudentResume } from "@/server/services/students/upsert-resume"
import { deleteFile } from "@/server/storage/s3"

function mapStudentCvError(error: StudentCvServiceError) {
  createServiceORPCError(error, {
    codeMap: {
      EXPERIENCE_NOT_FOUND: "NOT_FOUND",
      EXPERIENCE_FORBIDDEN: "FORBIDDEN",
      PROJECT_NOT_FOUND: "NOT_FOUND",
      PROJECT_FORBIDDEN: "FORBIDDEN",
      RESUME_NOT_FOUND: "NOT_FOUND",
      INVALID_DATE_RANGE: "BAD_REQUEST",
    },
    fallbackMessage: "Student CV operation failed",
  })
}

function toOptionalDate(value: string | null | undefined, label: string) {
  if (value === undefined) return undefined
  if (value === null || value === "") return null
  return parseInputDate(value, label)
}

export const getStudentCvProcedure = studentProcedureGenerous.handler(
  async ({ context }) => getStudentCv(context.user.id),
)

export const createStudentExperienceProcedure = studentProcedureStandard
  .input(
    z.object({
      title: z.string().min(1).max(200),
      organization: z.string().min(1).max(200),
      description: z.string().max(4000).optional(),
      startDate: z.string().min(1),
      endDate: z.string().optional().or(z.literal("")),
      isCurrent: z.boolean().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      return await createStudentExperience(
        {
          title: input.title,
          organization: input.organization,
          description: input.description,
          startDate: parseInputDate(input.startDate, "Experience start date"),
          endDate: toOptionalDate(input.endDate, "Experience end date"),
          isCurrent: input.isCurrent,
        },
        context.user.id,
      )
    } catch (error) {
      if (isStudentCvServiceError(error)) {
        mapStudentCvError(error)
      }
      throw error
    }
  })

export const updateStudentExperienceProcedure = studentProcedureStandard
  .input(
    z.object({
      experienceId: z.string().min(1),
      title: z.string().min(1).max(200).optional(),
      organization: z.string().min(1).max(200).optional(),
      description: z.string().max(4000).optional(),
      startDate: z.string().optional(),
      endDate: z.string().nullable().optional(),
      isCurrent: z.boolean().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      return await updateStudentExperience(
        input.experienceId,
        {
          title: input.title,
          organization: input.organization,
          description: input.description,
          startDate: input.startDate
            ? parseInputDate(input.startDate, "Experience start date")
            : undefined,
          endDate: toOptionalDate(input.endDate, "Experience end date"),
          isCurrent: input.isCurrent,
        },
        context.user.id,
      )
    } catch (error) {
      if (isStudentCvServiceError(error)) {
        mapStudentCvError(error)
      }
      throw error
    }
  })

export const deleteStudentExperienceProcedure = studentProcedureStandard
  .input(z.object({ experienceId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      return await deleteStudentExperience(input.experienceId, context.user.id)
    } catch (error) {
      if (isStudentCvServiceError(error)) {
        mapStudentCvError(error)
      }
      throw error
    }
  })

export const createStudentProjectProcedure = studentProcedureStandard
  .input(
    z.object({
      name: z.string().min(1).max(200),
      summary: z.string().min(1).max(4000),
      projectUrl: z.string().url().optional().or(z.literal("")),
      repositoryUrl: z.string().url().optional().or(z.literal("")),
      startDate: z.string().optional().or(z.literal("")),
      endDate: z.string().optional().or(z.literal("")),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      return await createStudentProject(
        {
          name: input.name,
          summary: input.summary,
          projectUrl: input.projectUrl || null,
          repositoryUrl: input.repositoryUrl || null,
          startDate: toOptionalDate(input.startDate, "Project start date"),
          endDate: toOptionalDate(input.endDate, "Project end date"),
        },
        context.user.id,
      )
    } catch (error) {
      if (isStudentCvServiceError(error)) {
        mapStudentCvError(error)
      }
      throw error
    }
  })

export const updateStudentProjectProcedure = studentProcedureStandard
  .input(
    z.object({
      projectId: z.string().min(1),
      name: z.string().min(1).max(200).optional(),
      summary: z.string().min(1).max(4000).optional(),
      projectUrl: z.string().url().nullable().optional().or(z.literal("")),
      repositoryUrl: z.string().url().nullable().optional().or(z.literal("")),
      startDate: z.string().nullable().optional(),
      endDate: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      return await updateStudentProject(
        input.projectId,
        {
          name: input.name,
          summary: input.summary,
          projectUrl: input.projectUrl || null,
          repositoryUrl: input.repositoryUrl || null,
          startDate: toOptionalDate(input.startDate, "Project start date"),
          endDate: toOptionalDate(input.endDate, "Project end date"),
        },
        context.user.id,
      )
    } catch (error) {
      if (isStudentCvServiceError(error)) {
        mapStudentCvError(error)
      }
      throw error
    }
  })

export const deleteStudentProjectProcedure = studentProcedureStandard
  .input(z.object({ projectId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      return await deleteStudentProject(input.projectId, context.user.id)
    } catch (error) {
      if (isStudentCvServiceError(error)) {
        mapStudentCvError(error)
      }
      throw error
    }
  })

export const uploadStudentResumeProcedure = studentProcedureStandard
  .input(z.object({ file: z.file() }))
  .handler(async ({ input, context }) => {
    const file = input.file

    if (file.type !== "application/pdf") {
      throw new ORPCError("BAD_REQUEST", {
        message: "Resume must be a PDF file",
      })
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Resume file size cannot exceed 10MB",
      })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const key = `resumes/${context.user.id}/${randomUUID()}.pdf`
    const fileUrl = await uploadFile(key, buffer, file.type)

    const resume = await upsertStudentResume(context.user.id, {
      fileKey: key,
      fileName: file.name,
      fileUrl,
      fileSizeBytes: file.size,
      mimeType: file.type,
    })

    return { resume }
  })

export const deleteStudentResumeProcedure = studentProcedureStandard.handler(
  async ({ context }) => {
    try {
      const result = await deleteStudentResume(context.user.id)
      try {
        await deleteFile(result.fileKey)
      } catch {
        // Resume metadata is already removed; storage cleanup can fail safely.
      }
      return { deleted: true }
    } catch (error) {
      if (isStudentCvServiceError(error)) {
        mapStudentCvError(error)
      }
      throw error
    }
  },
)
