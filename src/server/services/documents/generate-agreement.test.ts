import { beforeEach, describe, expect, mock, test } from "bun:test"

const selectResultsQueue: unknown[][] = []
const insertResultsQueue: unknown[][] = []

const renderToBufferMock = mock(async () => new Uint8Array([1]))
const generateQRCodeDataUrlMock = mock(async () => "data:image/png;base64,qr")
const generateVerificationCodeMock = mock(() => "INTX-ABCD-EF12")
const createNotificationMock = mock(async () => ({
  id: "notification-1",
  skipped: false,
}))
const sendAgreementEmailMock = mock(async () => undefined)

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

function applyGenerateAgreementMocks() {
  mock.module("@react-pdf/renderer", () => ({
    renderToBuffer: renderToBufferMock,
  }))

  mock.module("@/server/pdfs/AgreementTemplate", () => ({
    ConventionDeStageTemplate: () => null,
  }))

  mock.module("@/env", () => ({
    env: { NEXT_PUBLIC_BETTER_AUTH_URL: "https://stag.test" },
  }))

  mock.module("@/server/services/documents/qr-utils", () => ({
    generateQRCodeDataUrl: generateQRCodeDataUrlMock,
  }))

  mock.module("@/server/services/documents/verification-code", () => ({
    generateVerificationCode: generateVerificationCodeMock,
    isValidVerificationCodeFormat: (code: string) =>
      /^INTX-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(code),
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
}

async function importGenerateAgreement() {
  return (await import(
    `@/server/services/documents/generate-agreement?fresh=${Date.now()}`
  )) as typeof import("@/server/services/documents/generate-agreement")
}

describe("src/server/services/documents/generate-agreement", () => {
  beforeEach(() => {
    applyGenerateAgreementMocks()

    selectResultsQueue.length = 0
    insertResultsQueue.length = 0

    renderToBufferMock.mockClear()
    generateQRCodeDataUrlMock.mockClear()
    generateVerificationCodeMock.mockClear()
    createNotificationMock.mockClear()
    sendAgreementEmailMock.mockClear()
    selectLimitMock.mockClear()
    insertReturningMock.mockClear()
    insertValuesMock.mockClear()
    updateSetMock.mockClear()
    updateWhereMock.mockClear()

    renderToBufferMock.mockResolvedValue(new Uint8Array([1]))
    generateVerificationCodeMock.mockReturnValue("INTX-ABCD-EF12")
  })

  test("throws typed error when placement does not exist", async () => {
    selectResultsQueue.push([])

    const { generateAgreement } = await importGenerateAgreement()

    await expect(
      generateAgreement({
        placementId: "p-1",
        issuer: {
          userId: "admin-1",
          role: "university_admin",
          universityId: "uni-1",
          departmentId: null,
        },
      }),
    ).rejects.toMatchObject({
      code: "PLACEMENT_NOT_FOUND",
      message: "Placement not found",
    })
  })

  test("allows same-university university admin to issue pending agreement", async () => {
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
          studentUniversityId: "uni-1",
          studentDepartmentId: "dep-1",
          studentPhone: null,
          studentNumber: null,
          studentDepartment: null,
          studentAddress: null,
          universityName: "University One",
          universityDepartmentName: null,
          universityAddress: null,
          universityPhone: null,
        },
      ],
      [
        {
          id: "doc-pending",
          placementId: "placement-1",
          type: "agreement",
          status: "pending",
          verificationCode: null,
          meta: null,
        },
      ],
    )

    const { generateAgreement } = await importGenerateAgreement()

    const result = await generateAgreement({
      placementId: "placement-1",
      locale: "en",
      issuer: {
        userId: "admin-1",
        role: "university_admin",
        universityId: "uni-1",
        departmentId: null,
      },
    } as never)

    expect(result.success).toBe(true)
    expect(result.documentId).toBe("doc-pending")
    expect(updateSetMock).toHaveBeenCalledTimes(1)
    expect(updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "generated",
        verificationCode: "INTX-ABCD-EF12",
        meta: expect.objectContaining({
          locale: "en",
          fileName: "agreement_placement-1.pdf",
          issuedByUserId: "admin-1",
          issuedByRole: "university_admin",
        }),
      }),
    )
  })

  test("rejects cross-university university admin issuer", async () => {
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
          studentUniversityId: "uni-1",
          studentDepartmentId: "dep-1",
          studentPhone: null,
          studentNumber: null,
          studentDepartment: null,
          studentAddress: null,
          universityName: "University One",
          universityDepartmentName: null,
          universityAddress: null,
          universityPhone: null,
        },
      ],
    )

    const { generateAgreement } = await importGenerateAgreement()

    await expect(
      generateAgreement({
        placementId: "placement-1",
        locale: "en",
        issuer: {
          userId: "admin-2",
          role: "university_admin",
          universityId: "uni-2",
          departmentId: null,
        },
      } as never),
    ).rejects.toMatchObject({
      code: "PLACEMENT_FORBIDDEN",
      message: "You do not have access to this placement",
    })
  })

  test("rejects cross-department department head issuer", async () => {
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
          studentUniversityId: "uni-1",
          studentDepartmentId: "dep-1",
          studentPhone: null,
          studentNumber: null,
          studentDepartment: null,
          studentAddress: null,
          universityName: "University One",
          universityDepartmentName: null,
          universityAddress: null,
          universityPhone: null,
        },
      ],
    )

    const { generateAgreement } = await importGenerateAgreement()

    await expect(
      generateAgreement({
        placementId: "placement-1",
        locale: "en",
        issuer: {
          userId: "head-1",
          role: "dept_head",
          universityId: "uni-1",
          departmentId: "dep-2",
        },
      } as never),
    ).rejects.toMatchObject({
      code: "PLACEMENT_FORBIDDEN",
      message: "You do not have access to this placement",
    })
  })

  test("rejects super admin as normal agreement issuer", async () => {
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
          studentUniversityId: "uni-1",
          studentDepartmentId: "dep-1",
          studentPhone: null,
          studentNumber: null,
          studentDepartment: null,
          studentAddress: null,
          universityName: "University One",
          universityDepartmentName: null,
          universityAddress: null,
          universityPhone: null,
        },
      ],
    )

    const { generateAgreement } = await importGenerateAgreement()

    await expect(
      generateAgreement({
        placementId: "placement-1",
        locale: "en",
        issuer: {
          userId: "super-1",
          role: "super_admin",
          universityId: "uni-1",
          departmentId: null,
        },
      } as never),
    ).rejects.toMatchObject({
      code: "PLACEMENT_FORBIDDEN",
      message: "You do not have access to this placement",
    })
  })

  test("preserves immutable issuance metadata when agreement already exists", async () => {
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
          studentUniversityId: "uni-1",
          studentDepartmentId: "dep-1",
          studentPhone: null,
          studentNumber: null,
          studentDepartment: null,
          studentAddress: null,
          universityName: "University One",
          universityDepartmentName: null,
          universityAddress: null,
          universityPhone: null,
        },
      ],
      [
        {
          id: "doc-generated",
          placementId: "placement-1",
          type: "agreement",
          status: "generated",
          verificationCode: "INTX-CANON-ICAL",
          meta: {
            generatedAt: "2026-01-05T09:00:00.000Z",
            locale: "fr",
            fileName: "agreement_custom.pdf",
            issuedByUserId: "admin-1",
            issuedByRole: "university_admin",
          },
        },
      ],
    )

    const { generateAgreement } = await importGenerateAgreement()

    const result = await generateAgreement({
      placementId: "placement-1",
      locale: "ar",
      issuer: {
        userId: "admin-1",
        role: "university_admin",
        universityId: "uni-1",
        departmentId: null,
      },
    } as never)

    expect(result.success).toBe(true)
    expect(result.documentId).toBe("doc-generated")
    expect(updateSetMock).not.toHaveBeenCalled()
    expect(generateQRCodeDataUrlMock).toHaveBeenCalledWith(
      "https://stag.test/fr/verify/INTX-CANON-ICAL",
    )
    expect(createNotificationMock).not.toHaveBeenCalled()
    expect(sendAgreementEmailMock).not.toHaveBeenCalled()
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
          studentUniversityId: "uni-1",
          studentDepartmentId: "dep-1",
          studentPhone: null,
          studentNumber: null,
          studentDepartment: null,
          studentAddress: null,
          universityName: "University One",
          universityDepartmentName: null,
          universityAddress: null,
          universityPhone: null,
        },
      ],
      [],
      [
        {
          id: "doc-existing",
          status: "generated",
          verificationCode: "INTX-ZZZZ-YYYY",
          meta: {
            generatedAt: "2026-01-05T09:00:00.000Z",
            locale: "en",
            fileName: "agreement_placement-1.pdf",
            issuedByUserId: "admin-1",
            issuedByRole: "university_admin",
          },
        },
      ],
    )

    insertResultsQueue.push([])

    renderToBufferMock
      .mockResolvedValueOnce(new Uint8Array([1]))
      .mockResolvedValueOnce(new Uint8Array([2]))

    const { generateAgreement } = await importGenerateAgreement()

    const result = await generateAgreement({
      placementId: "placement-1",
      locale: "en",
      issuer: {
        userId: "admin-1",
        role: "university_admin",
        universityId: "uni-1",
        departmentId: null,
      },
    } as never)

    expect(result.success).toBe(true)
    expect(result.documentId).toBe("doc-existing")
    expect(result.buffer).toEqual(Buffer.from([2]))
    expect(renderToBufferMock).toHaveBeenCalledTimes(2)
    expect(createNotificationMock).not.toHaveBeenCalled()
    expect(sendAgreementEmailMock).not.toHaveBeenCalled()
    expect(updateWhereMock).not.toHaveBeenCalled()
  })
})
