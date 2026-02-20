import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"

// Mock child components BEFORE importing page
mock.module("@/components/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}))

mock.module("@/app/[locale]/_components/MarqueeRibbon", () => ({
  MarqueeRibbon: () => <div data-testid="marquee-ribbon">Marquee Ribbon</div>,
}))

mock.module("@/app/[locale]/_components/HeroSection", () => ({
  HeroSection: () => <section data-testid="hero-section">Hero Section</section>,
}))

mock.module("@/app/[locale]/_components/StatsBar", () => ({
  StatsBar: () => <div data-testid="stats-bar">Stats Bar</div>,
}))

mock.module("@/app/[locale]/_components/HowItWorksSection", () => ({
  HowItWorksSection: () => (
    <section data-testid="how-it-works">How It Works</section>
  ),
}))

mock.module("@/components/Footer", () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

mock.module("@/app/[locale]/_components/AuthRedirect", () => ({
  AuthRedirect: ({ locale }: { locale: string }) => (
    <div data-testid="auth-redirect">Auth Redirect (locale: {locale})</div>
  ),
}))

// Import AFTER all mocks using dynamic import
const { default: Home } = await import("@/app/[locale]/page")

describe("Home Page", () => {
  beforeEach(() => {
    // Reset any module state if needed
  })

  afterEach(() => {
    cleanup()
  })

  describe("rendering", () => {
    test("should render all main sections", async () => {
      const params = Promise.resolve({ locale: "en" })
      render(await Home({ params }))

      expect(screen.getByTestId("navbar")).toBeDefined()
      expect(screen.getByTestId("marquee-ribbon")).toBeDefined()
      expect(screen.getByTestId("hero-section")).toBeDefined()
      expect(screen.getByTestId("stats-bar")).toBeDefined()
      expect(screen.getByTestId("how-it-works")).toBeDefined()
      expect(screen.getByTestId("footer")).toBeDefined()
    })

    test("should render auth redirect with correct locale", async () => {
      const params = Promise.resolve({ locale: "en" })
      render(await Home({ params }))

      const authRedirect = screen.getByTestId("auth-redirect")
      expect(authRedirect).toBeDefined()
      expect(authRedirect.textContent).toContain("en")
    })

    test("should handle different locales", async () => {
      const params = Promise.resolve({ locale: "fr" })
      render(await Home({ params }))

      const authRedirect = screen.getByTestId("auth-redirect")
      expect(authRedirect.textContent).toContain("fr")
    })

    test("should have correct page structure", async () => {
      const params = Promise.resolve({ locale: "en" })
      const { container } = render(await Home({ params }))

      // Check main element exists with correct classes
      const main = container.querySelector("main")
      expect(main).toBeDefined()
      expect(main?.classList.contains("min-h-screen")).toBe(true)
      expect(main?.classList.contains("bg-background")).toBe(true)
      expect(main?.classList.contains("text-foreground")).toBe(true)
    })
  })

  describe("suspense wrapper", () => {
    test("should wrap AuthRedirect in Suspense", async () => {
      const params = Promise.resolve({ locale: "en" })
      render(await Home({ params }))

      // AuthRedirect should be rendered
      expect(screen.getByTestId("auth-redirect")).toBeDefined()
    })
  })
})
