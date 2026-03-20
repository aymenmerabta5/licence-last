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

const getStudentCvMock = mock(async () => ({
  experiences: [],
  projects: [],
  resume: null,
}))
const createStudentExperienceMock = mock(async () => ({ id: "exp-1" }))
const createStudentProjectMock = mock(async () => ({ id: "proj-1" }))
const deleteStudentExperienceMock = mock(async () => ({ deleted: true }))
const deleteStudentProjectMock = mock(async () => ({ deleted: true }))
const deleteStudentResumeMock = mock(async () => ({
  fileKey: "resumes/student-1/old.pdf",
}))
const updateStudentExperienceMock = mock(async () => ({ id: "exp-1" }))
const updateStudentProjectMock = mock(async () => ({ id: "proj-1" }))
const upsertStudentResumeMock = mock(async () => ({ id: "resume-1" }))
const uploadFileMock = mock(async () => "https://cdn.example.com/resume.pdf")
const deleteFileMock = mock(async () => {})
const parseInputDateMock = mock((value: string, fieldLabel: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldLabel} is invalid`)
  }
  return parsed
})

function applyStudentCvRouteMocks() {
  mock.module("@/server/orpc/rate-limited-procedures", () => ({
    publicProcedureStrict: createProcedureMock(),
    publicProcedureStandard: createProcedureMock(),
    authedSessionProcedureStandard: createProcedureMock(),
    authedSessionProcedureGenerous: createProcedureMock(),
    authedProcedureGenerous: createProcedureMock(),
    authedProcedureStandard: createProcedureMock(),
    authedProcedureStrict: createProcedureMock(),
    adminProcedureGenerous: createProcedureMock(),
    adminProcedureStandard: createProcedureMock(),
    adminProcedureAssistant: createProcedureMock(),
    universityProcedureAssistant: createProcedureMock(),
    superAdminProcedureGenerous: createProcedureMock(),
    superAdminProcedureStandard: createProcedureMock(),
    assistantProcedureLimited: createProcedureMock(),
    companyAdminProcedureStandard: createProcedureMock(),
    companyAdminProcedureGenerous: createProcedureMock(),
    companyAdminProcedureAssistant: createProcedureMock(),
    studentProcedureGenerous: createProcedureMock(),
    studentProcedureStandard: createProcedureMock(),
    deptHeadProcedureStandard: createProcedureMock(),
    deptHeadProcedureGenerous: createProcedureMock(),
  }))
  mock.module("@/server/orpc/utils/date", () => ({
    parseInputDate: parseInputDateMock,
    validatePlacementDateRange: (startDate: Date, endDate: Date) => {
      if (startDate >= endDate) {
        throw new Error("Start date must be before end date")
      }
    },
  }))
  mock.module("@/server/services/students/get-cv", () => ({
    getStudentCv: getStudentCvMock,
  }))
  mock.module("@/server/services/students/create-experience", () => ({
    createStudentExperience: createStudentExperienceMock,
  }))
  mock.module("@/server/services/students/create-project", () => ({
    createStudentProject: createStudentProjectMock,
  }))
  mock.module("@/server/services/students/delete-experience", () => ({
    deleteStudentExperience: deleteStudentExperienceMock,
  }))
  mock.module("@/server/services/students/delete-project", () => ({
    deleteStudentProject: deleteStudentProjectMock,
  }))
  mock.module("@/server/services/students/delete-resume", () => ({
    deleteStudentResume: deleteStudentResumeMock,
  }))
  mock.module("@/server/services/students/update-experience", () => ({
    updateStudentExperience: updateStudentExperienceMock,
  }))
  mock.module("@/server/services/students/update-project", () => ({
    updateStudentProject: updateStudentProjectMock,
  }))
  mock.module("@/server/services/students/upsert-resume", () => ({
    upsertStudentResume: upsertStudentResumeMock,
  }))
  mock.module("@/server/storage/s3", () => ({
    uploadFile: uploadFileMock,
    deleteFile: deleteFileMock,
    getFile: mock(async () => Buffer.from("")),
    isConfigured: () => true,
  }))
}

let studentCvRouteImportVersion = 0
async function loadStudentCvRouteModule() {
  studentCvRouteImportVersion += 1
  return import(
    `@/server/orpc/routes/student-cv?test=${studentCvRouteImportVersion}`
  )
}

describe("src/server/orpc/routes/student-cv", () => {
  beforeEach(() => {
    applyStudentCvRouteMocks()
    getStudentCvMock.mockClear()
    createStudentExperienceMock.mockClear()
    createStudentProjectMock.mockClear()
    deleteStudentExperienceMock.mockClear()
    deleteStudentProjectMock.mockClear()
    deleteStudentResumeMock.mockClear()
    updateStudentExperienceMock.mockClear()
    updateStudentProjectMock.mockClear()
    upsertStudentResumeMock.mockClear()
    uploadFileMock.mockClear()
    deleteFileMock.mockClear()
    parseInputDateMock.mockClear()
  })

  test("getStudentCvProcedure delegates with student user id", async () => {
    const { getStudentCvProcedure } = await loadStudentCvRouteModule()

    const result = await callProcedure(getStudentCvProcedure, {
      context: { user: { id: "student-1" } },
    })

    expect(result).toEqual({ experiences: [], projects: [], resume: null })
    expect(getStudentCvMock).toHaveBeenCalledWith("student-1")
  })

  test("createStudentExperienceProcedure parses dates and delegates", async () => {
    const { createStudentExperienceProcedure } =
      await loadStudentCvRouteModule()

    const result = await callProcedure(createStudentExperienceProcedure, {
      input: {
        title: "Software Intern",
        organization: "Acme",
        startDate: "2026-01-01T00:00:00.000Z",
        endDate: "2026-02-01T00:00:00.000Z",
      },
      context: { user: { id: "student-1" } },
    })

    expect(result).toEqual({ id: "exp-1" })
    expect(parseInputDateMock).toHaveBeenCalledTimes(2)
    expect(createStudentExperienceMock).toHaveBeenCalledWith(
      {
        title: "Software Intern",
        organization: "Acme",
        description: undefined,
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-02-01T00:00:00.000Z"),
        isCurrent: undefined,
      },
      "student-1",
    )
  })

  test("uploadStudentResumeProcedure rejects non-PDF files", async () => {
    const { uploadStudentResumeProcedure } = await loadStudentCvRouteModule()

    const file = new File(["hello"], "resume.txt", { type: "text/plain" })
    await expect(
      callProcedure(uploadStudentResumeProcedure, {
        input: { file },
        context: { user: { id: "student-1" } },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Resume must be a PDF file",
    })
  })

  test("uploadStudentResumeProcedure rejects files above 10MB", async () => {
    const { uploadStudentResumeProcedure } = await loadStudentCvRouteModule()

    const file = new File([new Uint8Array([37, 80, 68, 70])], "resume.pdf", {
      type: "application/pdf",
    })
    Object.defineProperty(file, "size", {
      value: 10 * 1024 * 1024 + 1,
      configurable: true,
    })

    await expect(
      callProcedure(uploadStudentResumeProcedure, {
        input: { file },
        context: { user: { id: "student-1" } },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Resume file size cannot exceed 10MB",
    })
  })

  test("uploadStudentResumeProcedure rejects mismatched PDF magic bytes", async () => {
    const { uploadStudentResumeProcedure } = await loadStudentCvRouteModule()

    // PNG header while declaring PDF.
    const file = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47])],
      "resume.pdf",
      { type: "application/pdf" },
    )

    await expect(
      callProcedure(uploadStudentResumeProcedure, {
        input: { file },
        context: { user: { id: "student-1" } },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "File content does not match PDF format",
    })
  })

  test("uploadStudentResumeProcedure uploads PDF and persists resume metadata", async () => {
    const { uploadStudentResumeProcedure } = await loadStudentCvRouteModule()

    const file = new File([new Uint8Array([37, 80, 68, 70])], "resume.pdf", {
      type: "application/pdf",
    })
    const result = await callProcedure(uploadStudentResumeProcedure, {
      input: { file },
      context: { user: { id: "student-1" } },
    })

    expect(uploadFileMock).toHaveBeenCalledTimes(1)
    expect(upsertStudentResumeMock).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ resume: { id: "resume-1" } })
  })

  test("deleteStudentResumeProcedure deletes metadata and storage file", async () => {
    const { deleteStudentResumeProcedure } = await loadStudentCvRouteModule()

    const result = await callProcedure(deleteStudentResumeProcedure, {
      context: { user: { id: "student-1" } },
    })

    expect(deleteStudentResumeMock).toHaveBeenCalledWith("student-1")
    expect(deleteFileMock).toHaveBeenCalledWith("resumes/student-1/old.pdf")
    expect(result).toEqual({ deleted: true })
  })
})
