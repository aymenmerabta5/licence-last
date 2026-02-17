import { describe, test, expect } from "bun:test"
import { parseDomains } from "@/server/db/seed"

describe("parseDomains", () => {
  describe("valid inputs", () => {
    test("should parse single domain", () => {
      expect(parseDomains("usthb.dz")).toEqual(["usthb.dz"])
    })

    test("should parse multiple domains", () => {
      expect(parseDomains("usthb.dz,univ-alger.dz,esi.dz")).toEqual([
        "usthb.dz",
        "univ-alger.dz",
        "esi.dz",
      ])
    })

    test("should handle domains with spaces after comma", () => {
      expect(parseDomains("usthb.dz, univ-alger.dz, esi.dz")).toEqual([
        "usthb.dz",
        "univ-alger.dz",
        "esi.dz",
      ])
    })

    test("should handle domains with spaces before comma", () => {
      expect(parseDomains("usthb.dz ,univ-alger.dz ,esi.dz")).toEqual([
        "usthb.dz",
        "univ-alger.dz",
        "esi.dz",
      ])
    })

    test("should handle mixed whitespace", () => {
      expect(parseDomains("  usthb.dz  ,  univ-alger.dz  ,  esi.dz  ")).toEqual([
        "usthb.dz",
        "univ-alger.dz",
        "esi.dz",
      ])
    })
  })

  describe("case normalization", () => {
    test("should lowercase all domains", () => {
      expect(parseDomains("USTHB.DZ,Univ-Alger.DZ")).toEqual([
        "usthb.dz",
        "univ-alger.dz",
      ])
    })

    test("should handle mixed case domains", () => {
      expect(parseDomains("UstHb.Dz,UnIv.AlGeR.DZ")).toEqual([
        "usthb.dz",
        "univ.alger.dz",
      ])
    })
  })

  describe("empty and invalid inputs", () => {
    test("should return empty array for undefined", () => {
      expect(parseDomains(undefined)).toEqual([])
    })

    test("should return empty array for empty string", () => {
      expect(parseDomains("")).toEqual([])
    })

    test("should return empty array for whitespace only", () => {
      expect(parseDomains("   ")).toEqual([])
    })

    test("should filter out empty strings from consecutive commas", () => {
      expect(parseDomains("usthb.dz,,univ-alger.dz")).toEqual([
        "usthb.dz",
        "univ-alger.dz",
      ])
    })

    test("should filter out whitespace-only entries", () => {
      expect(parseDomains("usthb.dz,   ,univ-alger.dz")).toEqual([
        "usthb.dz",
        "univ-alger.dz",
      ])
    })
  })

  describe("edge cases", () => {
    test("should handle single domain with trailing comma", () => {
      expect(parseDomains("usthb.dz,")).toEqual(["usthb.dz"])
    })

    test("should handle single domain with leading comma", () => {
      expect(parseDomains(",usthb.dz")).toEqual(["usthb.dz"])
    })

    test("should handle multiple consecutive commas", () => {
      expect(parseDomains("usthb.dz,,,,univ-alger.dz")).toEqual([
        "usthb.dz",
        "univ-alger.dz",
      ])
    })

    test("should handle domains with subdomains", () => {
      expect(parseDomains("cs.usthb.dz,eng.univ-alger.dz")).toEqual([
        "cs.usthb.dz",
        "eng.univ-alger.dz",
      ])
    })

    test("should handle international domains", () => {
      expect(parseDomains("sorbonne.fr,ox.ac.uk,mit.edu")).toEqual([
        "sorbonne.fr",
        "ox.ac.uk",
        "mit.edu",
      ])
    })
  })

  describe("real-world scenarios", () => {
    test("should handle typical Algerian university seed", () => {
      const input = "usthb.dz, univ-alger.dz, esi.dz, enp.dz, epau.dz"
      expect(parseDomains(input)).toEqual([
        "usthb.dz",
        "univ-alger.dz",
        "esi.dz",
        "enp.dz",
        "epau.dz",
      ])
    })

    test("should handle mixed case seed", () => {
      const input = "USTHB.DZ, Univ-Alger.DZ, ESI.dz"
      expect(parseDomains(input)).toEqual([
        "usthb.dz",
        "univ-alger.dz",
        "esi.dz",
      ])
    })

    test("should handle domains with hyphens", () => {
      expect(parseDomains("univ-alger.dz, univ-oran.dz, univ-constantine.dz")).toEqual([
        "univ-alger.dz",
        "univ-oran.dz",
        "univ-constantine.dz",
      ])
    })

    test("should handle long domain list", () => {
      const domains = Array.from({ length: 20 }, (_, i) => `univ${i}.dz`).join(",")
      const result = parseDomains(domains)
      expect(result).toHaveLength(20)
      expect(result[0]).toBe("univ0.dz")
      expect(result[19]).toBe("univ19.dz")
    })
  })
})
