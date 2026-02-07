import { describe, test, expect } from "bun:test"
import { isProtectedPath, PROTECTED_PATHS } from "./proxy"

describe("isProtectedPath", () => {
  describe("protected paths without locale", () => {
    test("should identify /dashboard as protected", () => {
      expect(isProtectedPath("/dashboard")).toBe(true)
    })

    test("should identify /dashboard/profile as protected", () => {
      expect(isProtectedPath("/dashboard/profile")).toBe(true)
    })

    test("should identify /dashboard/settings as protected", () => {
      expect(isProtectedPath("/dashboard/settings")).toBe(true)
    })

    test("should identify /dashboard/internships as protected", () => {
      expect(isProtectedPath("/dashboard/internships")).toBe(true)
    })

    test("should identify deeply nested dashboard paths as protected", () => {
      expect(isProtectedPath("/dashboard/settings/account/notifications")).toBe(true)
    })
  })

  describe("protected paths with English locale", () => {
    test("should identify /en/dashboard as protected", () => {
      expect(isProtectedPath("/en/dashboard")).toBe(true)
    })

    test("should identify /en/dashboard/profile as protected", () => {
      expect(isProtectedPath("/en/dashboard/profile")).toBe(true)
    })

    test("should identify /en/dashboard/settings as protected", () => {
      expect(isProtectedPath("/en/dashboard/settings")).toBe(true)
    })
  })

  describe("protected paths with French locale", () => {
    test("should identify /fr/dashboard as protected", () => {
      expect(isProtectedPath("/fr/dashboard")).toBe(true)
    })

    test("should identify /fr/dashboard/profile as protected", () => {
      expect(isProtectedPath("/fr/dashboard/profile")).toBe(true)
    })

    test("should identify /fr/dashboard/settings as protected", () => {
      expect(isProtectedPath("/fr/dashboard/settings")).toBe(true)
    })
  })

  describe("protected paths with Arabic locale", () => {
    test("should identify /ar/dashboard as protected", () => {
      expect(isProtectedPath("/ar/dashboard")).toBe(true)
    })

    test("should identify /ar/dashboard/profile as protected", () => {
      expect(isProtectedPath("/ar/dashboard/profile")).toBe(true)
    })

    test("should identify /ar/dashboard/settings as protected", () => {
      expect(isProtectedPath("/ar/dashboard/settings")).toBe(true)
    })
  })

  describe("unprotected paths", () => {
    test("should identify root as unprotected", () => {
      expect(isProtectedPath("/")).toBe(false)
    })

    test("should identify /login as unprotected", () => {
      expect(isProtectedPath("/login")).toBe(false)
    })

    test("should identify /signup as unprotected", () => {
      expect(isProtectedPath("/signup")).toBe(false)
    })

    test("should identify /about as unprotected", () => {
      expect(isProtectedPath("/about")).toBe(false)
    })

    test("should identify /contact as unprotected", () => {
      expect(isProtectedPath("/contact")).toBe(false)
    })

    test("should identify /internships as unprotected", () => {
      expect(isProtectedPath("/internships")).toBe(false)
    })
  })

  describe("unprotected paths with locales", () => {
    test("should identify /en/ as unprotected", () => {
      expect(isProtectedPath("/en/")).toBe(false)
    })

    test("should identify /en/login as unprotected", () => {
      expect(isProtectedPath("/en/login")).toBe(false)
    })

    test("should identify /fr/signup as unprotected", () => {
      expect(isProtectedPath("/fr/signup")).toBe(false)
    })

    test("should identify /ar/about as unprotected", () => {
      expect(isProtectedPath("/ar/about")).toBe(false)
    })
  })

  describe("similar paths that are also protected (startsWith behavior)", () => {
    test("should identify /dashboard-public as protected (starts with /dashboard)", () => {
      expect(isProtectedPath("/dashboard-public")).toBe(true)
    })

    test("should identify /dashboards as protected (starts with /dashboard)", () => {
      expect(isProtectedPath("/dashboards")).toBe(true)
    })

    test("should identify /my-dashboard as unprotected (does not start with /dashboard)", () => {
      expect(isProtectedPath("/my-dashboard")).toBe(false)
    })

    test("should identify /dashboard-old as protected (starts with /dashboard)", () => {
      expect(isProtectedPath("/dashboard-old")).toBe(true)
    })

    test("should identify /en/dashboard-public as protected", () => {
      expect(isProtectedPath("/en/dashboard-public")).toBe(true)
    })
  })

  describe("edge cases", () => {
    test("should handle empty string", () => {
      expect(isProtectedPath("")).toBe(false)
    })

    test("should handle path with query string (without locale)", () => {
      // Note: In real scenario, query strings are in search params, not pathname
      // But if they were somehow in pathname:
      expect(isProtectedPath("/dashboard?tab=profile")).toBe(true)
    })

    test("should handle path with hash (without locale)", () => {
      expect(isProtectedPath("/dashboard#settings")).toBe(true)
    })

    test("should handle api routes", () => {
      expect(isProtectedPath("/api/auth/login")).toBe(false)
      expect(isProtectedPath("/api/dashboard")).toBe(false)
    })

    test("should handle static files", () => {
      expect(isProtectedPath("/favicon.ico")).toBe(false)
      expect(isProtectedPath("/logo.png")).toBe(false)
    })

    test("should handle _next routes", () => {
      expect(isProtectedPath("/_next/static/chunks/main.js")).toBe(false)
    })
  })

  describe("invalid or unusual locales", () => {
    test("should not strip invalid locale codes", () => {
      // /es is not in the locale list, so it should be treated as part of the path
      expect(isProtectedPath("/es/dashboard")).toBe(false)
    })

    test("should not strip /de locale", () => {
      expect(isProtectedPath("/de/dashboard")).toBe(false)
    })

    test("should handle locale-like strings that are not locales", () => {
      expect(isProtectedPath("/en-us/dashboard")).toBe(false)
      expect(isProtectedPath("/en_us/dashboard")).toBe(false)
    })
  })
})

describe("PROTECTED_PATHS", () => {
  test("should contain /dashboard", () => {
    expect(PROTECTED_PATHS).toContain("/dashboard")
  })

  test("should be an array", () => {
    expect(Array.isArray(PROTECTED_PATHS)).toBe(true)
  })

  test("should not be empty", () => {
    expect(PROTECTED_PATHS.length).toBeGreaterThan(0)
  })
})
