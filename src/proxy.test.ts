import { describe, test, expect } from "bun:test"
import { isProtectedPath, isAuthPath, PROTECTED_PATHS, AUTH_PATHS } from "./proxy"

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

    test("should identify /profile as protected", () => {
      expect(isProtectedPath("/profile")).toBe(true)
    })

    test("should identify /profile/user-1 as protected", () => {
      expect(isProtectedPath("/profile/user-1")).toBe(true)
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

    test("should identify /en/profile/user-1 as protected", () => {
      expect(isProtectedPath("/en/profile/user-1")).toBe(true)
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

    test("should identify /fr/profile/user-1 as protected", () => {
      expect(isProtectedPath("/fr/profile/user-1")).toBe(true)
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

    test("should identify /ar/profile/user-1 as protected", () => {
      expect(isProtectedPath("/ar/profile/user-1")).toBe(true)
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

  describe("similar paths should not be treated as protected", () => {
    test("should identify /dashboard-public as unprotected", () => {
      expect(isProtectedPath("/dashboard-public")).toBe(false)
    })

    test("should identify /dashboards as unprotected", () => {
      expect(isProtectedPath("/dashboards")).toBe(false)
    })

    test("should identify /my-dashboard as unprotected (does not start with /dashboard)", () => {
      expect(isProtectedPath("/my-dashboard")).toBe(false)
    })

    test("should identify /dashboard-old as unprotected", () => {
      expect(isProtectedPath("/dashboard-old")).toBe(false)
    })

    test("should identify /en/dashboard-public as unprotected", () => {
      expect(isProtectedPath("/en/dashboard-public")).toBe(false)
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
      expect(isProtectedPath("/english/dashboard")).toBe(false)
      expect(isProtectedPath("/france/dashboard")).toBe(false)
    })
  })
})

describe("PROTECTED_PATHS", () => {
  test("should contain /dashboard", () => {
    expect(PROTECTED_PATHS).toContain("/dashboard")
  })

  test("should contain /onboarding", () => {
    expect(PROTECTED_PATHS).toContain("/onboarding")
  })

  test("should contain /profile", () => {
    expect(PROTECTED_PATHS).toContain("/profile")
  })

  test("should be an array", () => {
    expect(Array.isArray(PROTECTED_PATHS)).toBe(true)
  })

  test("should not be empty", () => {
    expect(PROTECTED_PATHS.length).toBeGreaterThan(0)
  })
})

describe("isAuthPath", () => {
  test("should identify /login as auth path", () => {
    expect(isAuthPath("/login")).toBe(true)
  })

  test("should identify /signup as auth path", () => {
    expect(isAuthPath("/signup")).toBe(true)
  })

  test("should identify /reset-password as auth path", () => {
    expect(isAuthPath("/reset-password")).toBe(true)
  })

  test("should identify /en/login as auth path", () => {
    expect(isAuthPath("/en/login")).toBe(true)
  })

  test("should identify /fr/signup as auth path", () => {
    expect(isAuthPath("/fr/signup")).toBe(true)
  })

  test("should identify /ar/reset-password as auth path", () => {
    expect(isAuthPath("/ar/reset-password")).toBe(true)
  })

  test("should not identify /dashboard as auth path", () => {
    expect(isAuthPath("/dashboard")).toBe(false)
  })

  test("should not strip locale prefixes from words like /english", () => {
    expect(isAuthPath("/english/login")).toBe(false)
  })

  test("should not identify / as auth path", () => {
    expect(isAuthPath("/")).toBe(false)
  })
})

describe("AUTH_PATHS", () => {
  test("should contain /login", () => {
    expect(AUTH_PATHS).toContain("/login")
  })

  test("should contain /signup", () => {
    expect(AUTH_PATHS).toContain("/signup")
  })

  test("should contain /reset-password", () => {
    expect(AUTH_PATHS).toContain("/reset-password")
  })
})

describe("onboarding protected paths", () => {
  test("should identify /onboarding as protected", () => {
    expect(isProtectedPath("/onboarding")).toBe(true)
  })

  test("should identify /onboarding/company as protected", () => {
    expect(isProtectedPath("/onboarding/company")).toBe(true)
  })

  test("should identify /en/onboarding/company as protected", () => {
    expect(isProtectedPath("/en/onboarding/company")).toBe(true)
  })

  test("should identify /fr/onboarding as protected", () => {
    expect(isProtectedPath("/fr/onboarding")).toBe(true)
  })
})
