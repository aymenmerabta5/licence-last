import { describe, expect, mock, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import type { ComponentProps, ReactNode } from "react"

mock.module("motion/react-client", () => ({
  div: ({
    children,
    whileHover: _whileHover,
    ...props
  }: ComponentProps<"div"> & { whileHover?: unknown }) => (
    <div {...props}>{children}</div>
  ),
}))

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
      data-testid="profile-header-image"
      aria-label={alt}
      data-src={src}
      data-unoptimized={String(Boolean(unoptimized))}
    />
  ),
}))

mock.module("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string, values?: Record<string, string>) =>
    values?.date ? `${key}:${values.date}` : key,
}))

mock.module("sonner", () => ({
  toast: {
    success: () => {},
    error: () => {},
  },
}))

mock.module("@/i18n/routing", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe("ProfileHeader", () => {
  test("renders remote user photos without Next image optimization", async () => {
    const { ProfileHeader } = await import(
      "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/components/ProfileHeader"
    )

    render(
      <ProfileHeader
        user={{
          id: "student-1",
          name: "Hadil Sahraoui",
          email: "hadil@example.com",
          role: "student",
          image: "https://cdn.example.com/avatars/hadil.png",
          createdAt: "2026-01-01T00:00:00.000Z",
        }}
        canEdit={true}
        profileText="Profile text"
        roleLabel="Student"
        university={{ name: "USTHB", city: "Algiers" }}
        department="Computer Science"
        level="L3"
      />,
    )

    const image = screen.getByTestId("profile-header-image")

    expect(image).toHaveAttribute(
      "data-src",
      "https://cdn.example.com/avatars/hadil.png",
    )
    expect(image).toHaveAttribute("data-unoptimized", "true")
  })
})
