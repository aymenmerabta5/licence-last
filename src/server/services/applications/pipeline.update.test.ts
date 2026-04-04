import { beforeEach, describe, expect, mock, test } from "bun:test"

const selectResultsQueue: unknown[][] = []

const selectLimitMock = mock(async () => selectResultsQueue.shift() ?? [])
const selectBuilder = {
  from: () => selectBuilder,
  innerJoin: () => selectBuilder,
  where: () => selectBuilder,
  limit: selectLimitMock,
}

const updateReturningMock = mock(async () => [{ id: "app-1" }])
const updateWhereMock = mock(() => ({ returning: updateReturningMock }))
const updateSetMock = mock(() => ({ where: updateWhereMock }))
const insertValuesMock = mock(async () => undefined)
const insertMock = mock(() => ({ values: insertValuesMock }))
const createNotificationMock = mock(async () => ({
  id: "notification-1",
  skipped: false,
}))

let moduleImportCounter = 0

function applyPipelineMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: () => ({ from: () => selectBuilder }),
      update: () => ({ set: updateSetMock }),
      insert: insertMock,
    },
  }))

  mock.module("@/server/services/notifications/create", () => ({
    createNotification: createNotificationMock,
  }))
}

async function loadPipelineModule() {
  moduleImportCounter += 1
  return import(
    `@/server/services/applications/pipeline?test=${moduleImportCounter}`
  )
}

function queueApplicationRow(
  overrides: Partial<{
    id: string
    pipelineStage: string
    status: string
    studentUserId: string
    offerCompanyId: string
  }> = {},
) {
  selectResultsQueue.push([
    {
      id: "app-1",
      pipelineStage: "screening",
      status: "applied",
      studentUserId: "student-1",
      offerCompanyId: "company-1",
      ...overrides,
    },
  ])
}

describe("src/server/services/applications/updateApplicationPipelineStage", () => {
  beforeEach(() => {
    applyPipelineMocks()

    selectResultsQueue.length = 0
    selectLimitMock.mockClear()
    updateSetMock.mockClear()
    updateWhereMock.mockClear()
    updateReturningMock.mockClear()
    insertMock.mockClear()
    insertValuesMock.mockClear()
    createNotificationMock.mockClear()
    updateReturningMock.mockResolvedValue([{ id: "app-1" }])
  })

  test("rejects when the application does not exist", async () => {
    selectResultsQueue.push([])

    const { updateApplicationPipelineStage } = await loadPipelineModule()

    await expect(
      updateApplicationPipelineStage({
        applicationId: "app-missing",
        actorUserId: "company-user-1",
        companyId: "company-1",
        toStage: "screening",
      }),
    ).rejects.toMatchObject({
      code: "APPLICATION_NOT_FOUND",
      message: "Application not found",
    })

    expect(updateSetMock).not.toHaveBeenCalled()
    expect(insertValuesMock).not.toHaveBeenCalled()
    expect(createNotificationMock).not.toHaveBeenCalled()
  })

  test("rejects when the actor does not own the offer", async () => {
    queueApplicationRow({ offerCompanyId: "company-2" })

    const { updateApplicationPipelineStage } = await loadPipelineModule()

    await expect(
      updateApplicationPipelineStage({
        applicationId: "app-1",
        actorUserId: "company-user-1",
        companyId: "company-1",
        toStage: "interview",
      }),
    ).rejects.toMatchObject({
      code: "APPLICATION_FORBIDDEN",
      message: "You do not have access to this application",
    })

    expect(updateSetMock).not.toHaveBeenCalled()
    expect(insertValuesMock).not.toHaveBeenCalled()
    expect(createNotificationMock).not.toHaveBeenCalled()
  })

  test("rejects stage changes once the application is no longer pending", async () => {
    queueApplicationRow({
      pipelineStage: "offer",
      status: "company_accepted",
    })

    const { updateApplicationPipelineStage } = await loadPipelineModule()

    await expect(
      updateApplicationPipelineStage({
        applicationId: "app-1",
        actorUserId: "company-user-1",
        companyId: "company-1",
        toStage: "interview",
      }),
    ).rejects.toMatchObject({
      code: "APPLICATION_INVALID_STATE",
      message:
        "Pipeline stage can only be updated while the application is pending company review",
    })

    expect(updateSetMock).not.toHaveBeenCalled()
  })

  test("rejects terminal pipeline targets", async () => {
    queueApplicationRow({ pipelineStage: "interview" })

    const { updateApplicationPipelineStage } = await loadPipelineModule()

    await expect(
      updateApplicationPipelineStage({
        applicationId: "app-1",
        actorUserId: "company-user-1",
        companyId: "company-1",
        toStage: "rejected",
      }),
    ).rejects.toMatchObject({
      code: "APPLICATION_INVALID_STATE",
      message:
        "Use explicit company/admin actions for terminal application decisions",
    })
  })

  test("rejects invalid non-terminal transitions", async () => {
    queueApplicationRow({ pipelineStage: "offer" })

    const { updateApplicationPipelineStage } = await loadPipelineModule()

    await expect(
      updateApplicationPipelineStage({
        applicationId: "app-1",
        actorUserId: "company-user-1",
        companyId: "company-1",
        toStage: "screening",
      }),
    ).rejects.toMatchObject({
      code: "APPLICATION_INVALID_STATE",
      message: "Invalid stage transition: offer -> screening",
    })

    expect(updateSetMock).not.toHaveBeenCalled()
    expect(insertValuesMock).not.toHaveBeenCalled()
    expect(createNotificationMock).not.toHaveBeenCalled()
  })

  test("updates non-terminal stages and appends a timeline event", async () => {
    queueApplicationRow()

    const { updateApplicationPipelineStage } = await loadPipelineModule()

    const result = await updateApplicationPipelineStage({
      applicationId: "app-1",
      actorUserId: "company-user-1",
      companyId: "company-1",
      toStage: "interview",
      note: "Move to interview",
    })

    expect(result).toEqual({
      applicationId: "app-1",
      studentUserId: "student-1",
      fromStage: "screening",
      toStage: "interview",
    })
    expect(updateSetMock).toHaveBeenCalledWith({
      pipelineStage: "interview",
      pipelineStageUpdatedAt: expect.any(Date),
    })
    expect(insertValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: "app-1",
        eventType: "pipeline_stage_changed",
        fromStage: "screening",
        toStage: "interview",
        fromStatus: "applied",
        toStatus: "applied",
      }),
    )
    expect(createNotificationMock).toHaveBeenCalledWith({
      userId: "student-1",
      type: "application_stage_changed",
      payload: {
        applicationId: "app-1",
        stage: "interview",
        note: "Move to interview",
      },
    })
  })

  test("normalizes blank notes to an empty timeline payload and null notification note", async () => {
    queueApplicationRow()

    const { updateApplicationPipelineStage } = await loadPipelineModule()

    await updateApplicationPipelineStage({
      applicationId: "app-1",
      actorUserId: "company-user-1",
      companyId: "company-1",
      toStage: "interview",
      note: "   ",
    })

    expect(insertValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: "app-1",
        eventType: "pipeline_stage_changed",
        payload: {},
      }),
    )
    expect(createNotificationMock).toHaveBeenCalledWith({
      userId: "student-1",
      type: "application_stage_changed",
      payload: {
        applicationId: "app-1",
        stage: "interview",
        note: null,
      },
    })
  })

  test("skips notifications when the actor is the student", async () => {
    queueApplicationRow({ studentUserId: "student-1" })

    const { updateApplicationPipelineStage } = await loadPipelineModule()

    await updateApplicationPipelineStage({
      applicationId: "app-1",
      actorUserId: "student-1",
      companyId: "company-1",
      toStage: "interview",
    })

    expect(updateSetMock).toHaveBeenCalledTimes(1)
    expect(insertValuesMock).toHaveBeenCalledTimes(1)
    expect(createNotificationMock).not.toHaveBeenCalled()
  })

  test("rejects when the pipeline stage changes concurrently", async () => {
    queueApplicationRow()
    updateReturningMock.mockResolvedValueOnce([])

    const { updateApplicationPipelineStage } = await loadPipelineModule()

    await expect(
      updateApplicationPipelineStage({
        applicationId: "app-1",
        actorUserId: "company-user-1",
        companyId: "company-1",
        toStage: "interview",
      }),
    ).rejects.toMatchObject({
      code: "APPLICATION_INVALID_STATE",
      message: "Application was changed by another action. Refresh and try again.",
    })

    expect(insertValuesMock).not.toHaveBeenCalled()
    expect(createNotificationMock).not.toHaveBeenCalled()
  })
})
