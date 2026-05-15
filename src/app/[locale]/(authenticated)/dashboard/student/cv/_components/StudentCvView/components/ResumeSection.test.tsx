import { describe, expect, mock, test } from "bun:test"
import { fireEvent, render } from "@testing-library/react"
import type * as React from "react"

mock.module("motion/react-client", () => ({
  section: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <section {...props}>{children}</section>
  ),
}))

mock.module("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

const { ResumeSection } = await import(
  "@/app/[locale]/(authenticated)/dashboard/student/cv/_components/StudentCvView/components/ResumeSection"
)

describe("ResumeSection", () => {
  test("clears the file input before awaiting upload", () => {
    let resolveUpload!: () => void
    const uploadPromise = new Promise<void>((resolve) => {
      resolveUpload = resolve
    })

    const onUpload = mock(async (_file: File) => {
      await uploadPromise
    })

    const { container } = render(
      <ResumeSection
        resume={null}
        isUploading={false}
        isDeleting={false}
        onUpload={onUpload}
        onDelete={async () => {}}
      />,
    )

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement
    const file = new File(["pdf"], "resume.pdf", { type: "application/pdf" })

    Object.defineProperty(input, "files", {
      configurable: true,
      value: [file],
    })
    Object.defineProperty(input, "value", {
      configurable: true,
      writable: true,
      value: "C:\\fakepath\\resume.pdf",
    })

    fireEvent.change(input)

    expect(onUpload).toHaveBeenCalledTimes(1)
    expect(onUpload.mock.calls[0]?.[0]).toBe(file)
    expect(input.value).toBe("")

    resolveUpload()
  })
})
