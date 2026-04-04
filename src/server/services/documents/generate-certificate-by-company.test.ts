import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

const selectResultsQueue: unknown[][] = []

const generateCertificateMock = mock(async () => ({
  success: true,
  documentId: "doc-1",
  buffer: Buffer.from("certificate"),
}))
const createNotificationMock = mock(async () => ({
  id: "notification-1",
  skipped: false,
}))
const sendCertificateEmailMock = mock(async () => undefined)

const selectLimitMock = mock(async () => selectResultsQueue.shift() ?? [])
const selectBuilder = {
  from: () => selectBuilder,
  innerJoin: () => selectBuilder,
  where: () => selectBuilder,
  limit: selectLimitMock,
}
const updateReturningMock = mock(async () => [{ id: "doc-1", meta: {} }])
const updateWhereMock = mock(() => ({ returning: updateReturningMock }))
const updateSetMock = mock(() => ({
  where: updateWhereMock,
}))
let moduleImportCounter = 0

function applyGenerateCertificateByCompanyMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: () => ({ from: () => selectBuilder }),
      update: () => ({
        set: updateSetMock,
      }),
    },
  }))

  mock.module("@/server/services/documents/generate-certificate", () => ({
    generateCertificate: generateCertificateMock,
  }))

  mock.module("@/server/services/notifications/create", () => ({
    createNotification: createNotificationMock,
  }))

  mock.module("@/server/services/documents/send-certificate-email", () => ({
    sendCertificateEmail: sendCertificateEmailMock,
  }))
}

async function loadGenerateCertificateByCompanyModule() {
  moduleImportCounter += 1
  return import(
    `@/server/services/documents/generate-certificate-by-company?test=${moduleImportCounter}`
  )
}

describe("src/server/services/documents/generate-certificate-by-company", () => {
  afterAll(() => {
    mock.restore()
  })

  beforeEach(() => {
    applyGenerateCertificateByCompanyMocks()
    selectResultsQueue.length = 0
    selectLimitMock.mockClear()
    updateSetMock.mockClear()
    updateWhereMock.mockClear()
    updateReturningMock.mockClear()
    generateCertificateMock.mockClear()
    createNotificationMock.mockClear()
    sendCertificateEmailMock.mockClear()
    updateReturningMock.mockResolvedValue([{ id: "doc-1", meta: {} }])
  })

  test("throws typed not-found error when placement is missing", async () => {
    selectResultsQueue.push([])

    const { generateCertificateByCompany } =
      await loadGenerateCertificateByCompanyModule()

    await expect(
      generateCertificateByCompany({
        placementId: "placement-1",
        companyId: "company-1",
        issuedByUserId: "admin-1",
        issuedByMembershipRole: "owner",
        locale: "en",
      } as never),
    ).rejects.toMatchObject({
      code: "PLACEMENT_NOT_FOUND",
      message: "Placement not found",
    })

    expect(generateCertificateMock).not.toHaveBeenCalled()
  })

  test("rejects recruiter company issuance", async () => {
    selectResultsQueue.push([
      {
        placementId: "placement-1",
        startDate: new Date("2030-01-01"),
        endDate: new Date("2030-02-01"),
        applicationStatus: "admin_validated",
        offerTitle: "Frontend Internship",
        internshipType: "pfe",
        companyId: "company-1",
        companyName: "Acme",
        studentUserId: "student-1",
        studentName: "Student",
        studentEmail: "student@example.com",
      },
    ])

    const { generateCertificateByCompany } =
      await loadGenerateCertificateByCompanyModule()

    await expect(
      generateCertificateByCompany({
        placementId: "placement-1",
        companyId: "company-1",
        issuedByUserId: "recruiter-1",
        issuedByMembershipRole: "recruiter",
        locale: "en",
      } as never),
    ).rejects.toMatchObject({
      code: "PLACEMENT_FORBIDDEN",
      message: "You do not have access to this placement",
    })

    expect(generateCertificateMock).not.toHaveBeenCalled()
  })

  test("rejects certificate generation when internship has not ended", async () => {
    selectResultsQueue.push([
      {
        placementId: "placement-1",
        startDate: new Date("2030-01-01"),
        endDate: new Date("2030-06-01"),
        applicationStatus: "admin_validated",
        offerTitle: "Frontend Internship",
        internshipType: "pfe",
        companyId: "company-1",
        companyName: "Acme",
        studentUserId: "student-1",
        studentName: "Student",
        studentEmail: "student@example.com",
      },
    ])

    const { generateCertificateByCompany } =
      await loadGenerateCertificateByCompanyModule()

    await expect(
      generateCertificateByCompany({
        placementId: "placement-1",
        companyId: "company-1",
        issuedByUserId: "owner-1",
        issuedByMembershipRole: "owner",
        locale: "en",
      } as never),
    ).rejects.toMatchObject({
      code: "INTERNSHIP_NOT_COMPLETED",
      message:
        "Certificate can only be generated after the internship end date",
    })

    expect(generateCertificateMock).not.toHaveBeenCalled()
  })

  test("stores membership-aware issuer metadata for owner issuance", async () => {
    selectResultsQueue.push(
      [
        {
          placementId: "placement-1",
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-02-01"),
          applicationStatus: "admin_validated",
          offerTitle: "Frontend Internship",
          internshipType: "pfe",
          companyId: "company-1",
          companyName: "Acme",
          studentUserId: "student-1",
          studentName: "Student",
          studentEmail: "student@example.com",
        },
      ],
      [
        {
          id: "doc-1",
          verificationCode: "INTX-ABCD-EF12",
          meta: {},
        },
      ],
    )

    const { generateCertificateByCompany } =
      await loadGenerateCertificateByCompanyModule()

    const result = await generateCertificateByCompany({
      placementId: "placement-1",
      companyId: "company-1",
      issuedByUserId: "owner-1",
      issuedByMembershipRole: "owner",
      locale: "en",
    } as never)

    expect(result.success).toBe(true)
    expect(result.documentId).toBe("doc-1")
    expect(updateSetMock).toHaveBeenCalledTimes(1)
    expect(updateSetMock).toHaveBeenCalledWith({
      meta: expect.objectContaining({
        issuedByUserId: "owner-1",
        issuedByRole: "company_admin",
        issuedByMembershipRole: "owner",
        issuedAt: expect.any(String),
      }),
    })
  })

  test("does not emit duplicate side effects when another request claims issuer metadata first", async () => {
    selectResultsQueue.push(
      [
        {
          placementId: "placement-1",
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-02-01"),
          applicationStatus: "admin_validated",
          offerTitle: "Frontend Internship",
          internshipType: "pfe",
          companyId: "company-1",
          companyName: "Acme",
          studentUserId: "student-1",
          studentName: "Student",
          studentEmail: "student@example.com",
        },
      ],
      [
        {
          id: "doc-1",
          verificationCode: "INTX-ABCD-EF12",
          meta: {},
        },
      ],
    )
    updateReturningMock.mockResolvedValueOnce([])

    const { generateCertificateByCompany } =
      await loadGenerateCertificateByCompanyModule()

    const result = await generateCertificateByCompany({
      placementId: "placement-1",
      companyId: "company-1",
      issuedByUserId: "owner-2",
      issuedByMembershipRole: "owner",
      locale: "en",
    } as never)

    expect(result.success).toBe(true)
    expect(result.documentId).toBe("doc-1")
    expect(updateSetMock).toHaveBeenCalledTimes(1)
    expect(createNotificationMock).not.toHaveBeenCalled()
    expect(sendCertificateEmailMock).not.toHaveBeenCalled()
  })

  test("preserves existing issuer metadata on repeated company issuance", async () => {
    selectResultsQueue.push(
      [
        {
          placementId: "placement-1",
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-02-01"),
          applicationStatus: "admin_validated",
          offerTitle: "Frontend Internship",
          internshipType: "pfe",
          companyId: "company-1",
          companyName: "Acme",
          studentUserId: "student-1",
          studentName: "Student",
          studentEmail: "student@example.com",
        },
      ],
      [
        {
          id: "doc-1",
          verificationCode: "INTX-ABCD-EF12",
          meta: {
            issuedByUserId: "owner-1",
            issuedByRole: "company_admin",
            issuedByMembershipRole: "owner",
            issuedAt: "2026-01-05T09:00:00.000Z",
          },
        },
      ],
    )

    const { generateCertificateByCompany } =
      await loadGenerateCertificateByCompanyModule()

    const result = await generateCertificateByCompany({
      placementId: "placement-1",
      companyId: "company-1",
      issuedByUserId: "owner-2",
      issuedByMembershipRole: "owner",
      locale: "fr",
    } as never)

    expect(result.success).toBe(true)
    expect(result.documentId).toBe("doc-1")
    expect(updateSetMock).not.toHaveBeenCalled()
  })
})
