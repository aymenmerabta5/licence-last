import { beforeEach, describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"

const suspendedVerification = new Promise<void>(() => {})
const verifyThroughOrpcMock = mock(async () => ({
  status: "valid",
}))
const verifyDocumentServiceMock = mock(async () => ({
  status: "legacy",
}))

let importCounter = 0

mock.module("@/server/orpc/client", () => ({
  orpcClient: {
    documents: {
      verify: verifyThroughOrpcMock,
    },
  },
}))

mock.module("@/server/services/documents/verify", () => ({
  verifyDocument: verifyDocumentServiceMock,
}))

mock.module("@/components/Footer", () => ({
  Footer: () => <div>Footer</div>,
}))

mock.module("@/components/Navbar", () => ({
  Navbar: () => <div>Navbar</div>,
}))

mock.module("@/app/[locale]/verify/[code]/_components/VerificationResult", () => ({
  VerificationResult: () => null,
}))

mock.module(
  "@/app/[locale]/verify/[code]/_components/VerificationResultSkeleton",
  () => ({
    VerificationResultSkeleton: () => <div>Verification skeleton</div>,
  }),
)

async function loadModule() {
  importCounter += 1
  return import(`@/app/[locale]/verify/[code]/page?test=${importCounter}`)
}

async function loadPageContentModule() {
  importCounter += 1
  return import(
    `@/app/[locale]/verify/[code]/_components/VerificationResultPageContent?test=${importCounter}`
  )
}

describe("src/app/[locale]/verify/[code]/page", () => {
  beforeEach(() => {
    verifyThroughOrpcMock.mockReset()
    verifyDocumentServiceMock.mockClear()
    verifyThroughOrpcMock.mockImplementation(async () => {
      await suspendedVerification
      return { status: "valid" }
    })
  })

  test("keeps the page shell synchronous while verification data suspends", async () => {
    const { default: VerifyResultPage } = await loadModule()

    render(
      await VerifyResultPage({
        params: Promise.resolve({ code: "CERT-123" }),
      }),
    )

    expect(screen.getByText("Navbar")).toBeDefined()
    expect(screen.getByText("Verification skeleton")).toBeDefined()
    expect(screen.getByText("Footer")).toBeDefined()
  })

  test("verifies documents through the public oRPC route", async () => {
    verifyThroughOrpcMock.mockResolvedValueOnce({
      status: "valid",
    })

    const { VerificationResultPageContent } = await loadPageContentModule()

    await VerificationResultPageContent({
      code: "CERT-123",
    })

    expect(verifyThroughOrpcMock).toHaveBeenCalledWith({ code: "CERT-123" })
    expect(verifyDocumentServiceMock).not.toHaveBeenCalled()
  })

  test("does not throw when the verification code is malformed URI input", async () => {
    const { default: VerifyResultPage } = await loadModule()

    await expect(
      VerifyResultPage({
        params: Promise.resolve({ code: "%" }),
      }),
    ).resolves.toBeDefined()
  })
})
