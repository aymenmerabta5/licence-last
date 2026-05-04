import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"

mock.module("next/image", () => ({
  default: ({
    alt,
    src,
    unoptimized,
  }: {
    alt: string
    src: string
    unoptimized?: boolean
  }) => (
    <div
      data-testid="avatar-image"
      aria-label={alt}
      data-src={src}
      data-unoptimized={String(Boolean(unoptimized))}
    />
  ),
}))

describe("AvatarSection", () => {
  test("renders uploaded profile photos without Next image optimization", async () => {
    const { AvatarSection } = await import(
      "@/app/[locale]/(authenticated)/dashboard/settings/_components/ProfileSettingsTab/components/AvatarSection"
    )

    render(
      <AvatarSection
        avatarInitial="A"
        imageUrl="https://cdn.example.com/avatars/student.png"
        isUploading={false}
        isDeleting={false}
        inputRef={{ current: null }}
        onUpload={() => {}}
        onDelete={async () => {}}
      />,
    )

    const image = screen.getByTestId("avatar-image")

    expect(image).toHaveAttribute(
      "data-src",
      "https://cdn.example.com/avatars/student.png",
    )
    expect(image).toHaveAttribute("data-unoptimized", "true")
  })
})
