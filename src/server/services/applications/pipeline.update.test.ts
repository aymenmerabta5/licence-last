import { beforeEach, describe, expect, mock, test } from "bun:test"

const selectResultsQueue: unknown[][] = []

const selectLimitMock = mock(async () => selectResultsQueue.shift() ?? [])
const selectBuilder = {
  from: () => selectBuilder,
  innerJoin: () => selectBuilder,
  where: () => selectBuilder,
  limit: selectLimitMock,
}

const updateWhereMock = mock(async () => undefined)
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

describe("src/server/services/applications/updateApplicationPipelineStage", () => {
  beforeEach(() => {
    applyPipelineMocks()

    selectResultsQueue.length = 0
    selectLimitMock.mockClear()
    updateSetMock.mockClear()
    updateWhereMock.mockClear()
    insertMock.mockClear()
    insertValuesMock.mockClear()
    createNotificationMock.mockClear()
  })

  test("rejects stage changes once the application is no longer pending", async () => {
    selectResultsQueue.push([
      {
        id: "app-1",
        pipelineStage: "offer",
        status: "company_accepted",
        studentUserId: "student-1",
        offerCompanyId: "company-1",
      },
    ])

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
    selectResultsQueue.push([
      {
        id: "app-1",
        pipelineStage: "interview",
        status: "applied",
        studentUserId: "student-1",
        offerCompanyId: "company-1",
      },
    ])

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
      message: "Use explicit company/admin actions for terminal application decisions",
    })
  })

  test("updates non-terminal stages and appends a timeline event", async () => {
    selectResultsQueue.push([
      {
        id: "app-1",
        pipelineStage: "screening",
        status: "applied",
        studentUserId: "student-1",
        offerCompanyId: "company-1",
      },
    ])

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
})
