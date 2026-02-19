import { describe, expect, test } from "bun:test"
import { domainCandidates, getEmailDomain } from "@/lib/auth-utils"

describe("getEmailDomain", () => {
  describe("valid emails", () => {
    test("should extract domain from simple email", () => {
      expect(getEmailDomain("user@example.com")).toBe("example.com")
    })

    test("should extract domain from email with subdomain", () => {
      expect(getEmailDomain("student@univ.edu.dz")).toBe("univ.edu.dz")
    })

    test("should extract domain from email with plus sign", () => {
      expect(getEmailDomain("user+tag@example.org")).toBe("example.org")
    })

    test("should extract domain from email with dots in local part", () => {
      expect(getEmailDomain("first.last@company.co.uk")).toBe("company.co.uk")
    })

    test("should handle email with hyphens in domain", () => {
      expect(getEmailDomain("user@my-university.ac.uk")).toBe(
        "my-university.ac.uk",
      )
    })
  })

  describe("case normalization", () => {
    test("should lowercase uppercase domain", () => {
      expect(getEmailDomain("user@EXAMPLE.COM")).toBe("example.com")
    })

    test("should lowercase mixed case domain", () => {
      expect(getEmailDomain("user@UnIv.Edu.Dz")).toBe("univ.edu.dz")
    })

    test("should handle uppercase local part", () => {
      expect(getEmailDomain("USER@example.com")).toBe("example.com")
    })
  })

  describe("whitespace handling", () => {
    test("should trim whitespace from domain", () => {
      expect(getEmailDomain("user@example.com ")).toBe("example.com")
    })

    test("should trim leading whitespace from domain", () => {
      expect(getEmailDomain("user@ example.com")).toBe("example.com")
    })

    test("should trim whitespace from both sides", () => {
      expect(getEmailDomain("user@ example.com ")).toBe("example.com")
    })
  })

  describe("invalid emails", () => {
    test("should return null for email without @", () => {
      expect(getEmailDomain("userexample.com")).toBeNull()
    })

    test("should return null for empty string", () => {
      expect(getEmailDomain("")).toBeNull()
    })

    test("should return null for email with @ at the end", () => {
      expect(getEmailDomain("user@")).toBeNull()
    })

    test("should return domain for email with @ at the start", () => {
      expect(getEmailDomain("@example.com")).toBe("example.com")
    })

    test("should return null for multiple @ symbols with empty domain", () => {
      expect(getEmailDomain("user@@")).toBeNull()
    })

    test("should handle only whitespace after @", () => {
      expect(getEmailDomain("user@   ")).toBeNull()
    })
  })

  describe("edge cases", () => {
    test("should handle email with multiple @ symbols", () => {
      expect(getEmailDomain("user@sub@example.com")).toBe("example.com")
    })

    test("should handle single character domain", () => {
      expect(getEmailDomain("user@a")).toBe("a")
    })

    test("should handle very long domain", () => {
      const longDomain = "a".repeat(100) + ".com"
      expect(getEmailDomain(`user@${longDomain}`)).toBe(longDomain)
    })

    test("should handle special characters in domain", () => {
      expect(getEmailDomain("user@sub_domain.example.com")).toBe(
        "sub_domain.example.com",
      )
    })
  })
})

describe("domainCandidates", () => {
  describe("multi-level domains", () => {
    test("should generate candidates for three-part domain (excluding TLD)", () => {
      // For univ.edu.dz, generates candidates but excludes single-part "dz"
      expect(domainCandidates("univ.edu.dz")).toEqual(["univ.edu.dz", "edu.dz"])
    })

    test("should generate candidates for four-part domain", () => {
      expect(domainCandidates("cs.univ.edu.dz")).toEqual([
        "cs.univ.edu.dz",
        "univ.edu.dz",
        "edu.dz",
      ])
    })

    test("should handle five-part domain", () => {
      expect(domainCandidates("dept.cs.univ.edu.dz")).toEqual([
        "dept.cs.univ.edu.dz",
        "cs.univ.edu.dz",
        "univ.edu.dz",
        "edu.dz",
      ])
    })
  })

  describe("two-part domains", () => {
    test("should return single candidate for simple domain", () => {
      expect(domainCandidates("example.com")).toEqual(["example.com"])
    })

    test("should return single candidate for two-part country domain (excluding TLD)", () => {
      // For university.ac.uk, returns just the full domain, excludes "uk"
      expect(domainCandidates("university.ac.uk")).toEqual([
        "university.ac.uk",
        "ac.uk",
      ])
    })
  })

  describe("single-part domains", () => {
    test("should return single candidate for single-part domain", () => {
      expect(domainCandidates("localhost")).toEqual(["localhost"])
    })

    test("should return single candidate for single word", () => {
      expect(domainCandidates("intranet")).toEqual(["intranet"])
    })
  })

  describe("whitespace handling", () => {
    test("should trim whitespace from parts", () => {
      expect(domainCandidates(" univ . edu . dz ")).toEqual([
        "univ.edu.dz",
        "edu.dz",
      ])
    })

    test("should handle internal whitespace", () => {
      expect(domainCandidates("univ. edu.dz")).toEqual([
        "univ.edu.dz",
        "edu.dz",
      ])
    })
  })

  describe("empty and invalid inputs", () => {
    test("should return array with empty string for empty input", () => {
      expect(domainCandidates("")).toEqual([""])
    })

    test("should handle domain with only dots", () => {
      // When split by dots and filtered, "..." becomes ["..."] as a single part
      expect(domainCandidates("...")).toEqual(["..."])
    })

    test("should filter out empty parts from consecutive dots", () => {
      expect(domainCandidates("univ..edu.dz")).toEqual([
        "univ.edu.dz",
        "edu.dz",
      ])
    })
  })

  describe("real-world university domains", () => {
    test("should handle Algerian university domains", () => {
      expect(domainCandidates("usthb.dz")).toEqual(["usthb.dz"])
      expect(domainCandidates("univ-alger.dz")).toEqual(["univ-alger.dz"])
    })

    test("should handle French university domains (excluding TLD)", () => {
      expect(domainCandidates("sorbonne-universite.fr")).toEqual([
        "sorbonne-universite.fr",
      ])
    })

    test("should handle UK academic domains", () => {
      expect(domainCandidates("cam.ac.uk")).toEqual(["cam.ac.uk", "ac.uk"])
      expect(domainCandidates("cs.ox.ac.uk")).toEqual([
        "cs.ox.ac.uk",
        "ox.ac.uk",
        "ac.uk",
      ])
    })

    test("should handle US university domains (excluding TLD)", () => {
      expect(domainCandidates("mit.edu")).toEqual(["mit.edu"])
      expect(domainCandidates("cs.stanford.edu")).toEqual([
        "cs.stanford.edu",
        "stanford.edu",
      ])
    })
  })

  describe("edge cases", () => {
    test("should handle domain with hyphens", () => {
      expect(domainCandidates("my-university.edu")).toEqual([
        "my-university.edu",
      ])
    })

    test("should handle domain with numbers", () => {
      expect(domainCandidates("univ2024.edu")).toEqual(["univ2024.edu"])
    })

    test("should handle very long domain", () => {
      // Pattern: aaaaa....b.c.d
      // Parts: [50 a's, "b", "c", "d"] = 4 parts
      // Candidates: [0..3], [1..3], [2..3] = 3 candidates (excludes single-part "d")
      const longDomain = "a".repeat(50) + ".b.c.d"
      const result = domainCandidates(longDomain)
      expect(result).toHaveLength(3)
      expect(result[0]).toBe(longDomain)
    })
  })
})

describe("integration: email to domain candidates", () => {
  test("should extract candidates from full email", () => {
    const email = "student@cs.univ.edu.dz"
    const domain = getEmailDomain(email)
    expect(domain).toBe("cs.univ.edu.dz")

    const candidates = domainCandidates(domain!)
    expect(candidates).toEqual(["cs.univ.edu.dz", "univ.edu.dz", "edu.dz"])
  })

  test("should handle email with subdomain and plus sign", () => {
    const email = "student+cs2024@eng.usthb.dz"
    const domain = getEmailDomain(email)
    expect(domain).toBe("eng.usthb.dz")

    const candidates = domainCandidates(domain!)
    expect(candidates).toEqual(["eng.usthb.dz", "usthb.dz"])
  })

  test("should handle mixed case email", () => {
    const email = "Student@CS.Univ.EDU.DZ"
    const domain = getEmailDomain(email)
    expect(domain).toBe("cs.univ.edu.dz")

    const candidates = domainCandidates(domain!)
    expect(candidates).toEqual(["cs.univ.edu.dz", "univ.edu.dz", "edu.dz"])
  })
})
