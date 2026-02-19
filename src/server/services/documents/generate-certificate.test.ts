import { beforeEach, describe, expect, mock, test } from "bun:test"

mock.module("@react-pdf/renderer", () => ({
  renderToBuffer: mock(async () => new Uint8Array()),
}))

mock.module("@/server/pdfs/CertificateTemplate", () => ({
  InternshipCertificateTemplate: () => null,
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit = mock<() => Promise<any[]>>(() => Promise.resolve([]))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))

mock.module("@/server/db", () => ({
  db: {
    select: () => ({ from: mockFrom }),
  },
}))

describe("src/server/services/documents/generate-certificate", () => {
  beforeEach(() => {
    mockLimit.mockClear()
    mockWhere.mockClear()
    mockFrom.mockClear()

    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockLimit.mockResolvedValue([])
  })

  test("should throw when placement does not exist", async () => {
    const { generateCertificate } = await import(
      "@/server/services/documents/generate-certificate"
    )
    await expect(generateCertificate({ placementId: "p-1" })).rejects.toThrow(
      "Placement not found",
    )
  })
})
