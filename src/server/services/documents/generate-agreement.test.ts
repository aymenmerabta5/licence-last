import { beforeEach, describe, expect, mock, test } from "bun:test"

const selectResultsQueue: unknown[][] = []
const insertResultsQueue: unknown[][] = []

const renderToBufferMock = mock(async () => new Uint8Array([1]))
const generateQRCodeDataUrlMock = mock(async () => "data:image/png;base64,qr")
const createNotificationMock = mock(async () => ({
  id: "notification-1",
  skipped: false,
}))
const sendAgreementEmailMock = mock(async () => undefined)
const generateVerificationCodeMock = mock(() => "INTX-AAAA-BBBB")

const selectLimitMock = mock(async () => selectResultsQueue.shift() ?? [])
const selectBuilder = {
  from: () => selectBuilder,
  innerJoin: () => selectBuilder,
  leftJoin: () => selectBuilder,
  where: () => selectBuilder,
  limit: selectLimitMock,
}

const insertReturningMock = mock(async () => insertResultsQueue.shift() ?? [])
const insertValuesMock = mock(() => ({
  onConflictDoNothing: () => ({ returning: insertReturningMock }),
  returning: insertReturningMock,
}))

const updateWhereMock = mock(async () => undefined)
const updateSetMock = mock(() => ({ where: updateWhereMock }))

mock.module("@react-pdf/renderer", () => ({
  renderToBuffer: renderToBufferMock,
}))

mock.module("@/server/pdfs/AgreementTemplate", () => ({
  ConventionDeStageTemplate: () => null,
}))

mock.module("@/env", () => ({
  env: { NEXT_PUBLIC_BETTER_AUTH_URL: "https://internex.test" },
}))

mock.module("@/server/services/documents/qr-utils", () => ({
  generateQRCodeDataUrl: generateQRCodeDataUrlMock,
}))

mock.module("@/server/services/documents/verification-code", () => ({
  generateVerificationCode: generateVerificationCodeMock,
}))

mock.module("@/server/services/notifications/create", () => ({
  createNotification: createNotificationMock,
}))

mock.module("@/server/services/documents/send-agreement-email", () => ({
  sendAgreementEmail: sendAgreementEmailMock,
}))

mock.module("@/server/db", () => ({
  db: {
    select: () => ({ from: () => selectBuilder }),
    insert: () => ({ values: insertValuesMock }),
    update: () => ({ set: updateSetMock }),
  },
}))

async function importGenerateAgreement() {
  return (await import(
    `@/server/services/documents/generate-agreement?fresh=${Date.now()}`
  )) as typeof import("@/server/services/documents/generate-agreement")
}

describe("src/server/services/documents/generate-agreement", () => {
  beforeEach(() => {
    selectResultsQueue.length = 0
    insertResultsQueue.length = 0

    renderToBufferMock.mockClear()
    generateQRCodeDataUrlMock.mockClear()
    createNotificationMock.mockClear()
    sendAgreementEmailMock.mockClear()
    generateVerificationCodeMock.mockClear()
    selectLimitMock.mockClear()
    insertReturningMock.mockClear()
    insertValuesMock.mockClear()
    updateSetMock.mockClear()
    updateWhereMock.mockClear()

    renderToBufferMock.mockResolvedValue(new Uint8Array([1]))
    generateVerificationCodeMock.mockReturnValue("INTX-AAAA-BBBB")
  })

  test("throws typed error when placement does not exist", async () => {
    selectResultsQueue.push([])

    const { generateAgreement } = await importGenerateAgreement()

    await expect(generateAgreement({ placementId: "p-1" })).rejects.toMatchObject(
      {
        code: "PLACEMENT_NOT_FOUND",
        message: "Placement not found",
      },
    )
  })

  test("handles concurrent insert conflict and regenerates with canonical verification code", async () => {
    selectResultsQueue.push(
      [
        {
          id: "placement-1",
          applicationId: "app-1",
          startDate: new Date("2030-01-01"),
          endDate: new Date("2030-02-01"),
        },
      ],
      [
        {
          applicationId: "app-1",
          offerTitle: "Frontend Internship",
          internshipType: "pfe",
          workMode: "remote",
          durationWeeks: 8,
          companyName: "Acme",
          companyAddress: null,
          companyPhone: null,
          companyRepresentativeName: null,
          companyContactEmail: null,
          studentName: "Student",
          studentEmail: "student@example.com",
          studentUserId: "student-1",
          studentUniversityId: null,
          studentPhone: null,
          studentNumber: null,
          studentDepartment: null,
          studentAddress: null,
          universityName: null,
          universityDepartmentName: null,
          universityAddress: null,
          universityPhone: null,
        },
      ],
      [],
      [{ id: "doc-existing", verificationCode: "INTX-ZZZZ-YYYY" }],
    )

    insertResultsQueue.push([])

    renderToBufferMock
      .mockResolvedValueOnce(new Uint8Array([1]))
      .mockResolvedValueOnce(new Uint8Array([2]))

    const { generateAgreement } = await importGenerateAgreement()

    const result = await generateAgreement({
      placementId: "placement-1",
      locale: "en",
    })

    expect(result.success).toBe(true)
    expect(result.documentId).toBe("doc-existing")
    expect(result.buffer).toEqual(Buffer.from([2]))
    expect(renderToBufferMock).toHaveBeenCalledTimes(2)
    expect(createNotificationMock).not.toHaveBeenCalled()
    expect(sendAgreementEmailMock).not.toHaveBeenCalled()
    expect(updateWhereMock).toHaveBeenCalledTimes(1)
  })
})
