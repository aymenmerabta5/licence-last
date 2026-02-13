import { describe, test, expect } from "bun:test"

import { calculateProfileCompleteness } from "./profile-completeness"

describe("calculateProfileCompleteness", () => {
  test("should return 0 for completely empty profile", () => {
    expect(calculateProfileCompleteness({ skillsCount: 0 })).toBe(0)
  })

  test("should return 100 for fully complete profile", () => {
    expect(
      calculateProfileCompleteness({
        bio: "I love coding",
        phone: "+213555123456",
        wilayaCode: 16,
        githubUrl: "https://github.com/dev",
        portfolioUrl: "https://dev.com",
        studentNumber: "STU-001",
        department: "Computer Science",
        skillsCount: 5,
      }),
    ).toBe(100)
  })

  test("should add 15 for bio", () => {
    expect(calculateProfileCompleteness({ bio: "Hello", skillsCount: 0 })).toBe(15)
  })

  test("should add 10 for phone", () => {
    expect(calculateProfileCompleteness({ phone: "123", skillsCount: 0 })).toBe(10)
  })

  test("should add 15 for wilayaCode > 0", () => {
    expect(calculateProfileCompleteness({ wilayaCode: 1, skillsCount: 0 })).toBe(15)
  })

  test("should not count wilayaCode of 0", () => {
    expect(calculateProfileCompleteness({ wilayaCode: 0, skillsCount: 0 })).toBe(0)
  })

  test("should add 20 for githubUrl alone", () => {
    expect(
      calculateProfileCompleteness({ githubUrl: "https://github.com/dev", skillsCount: 0 }),
    ).toBe(20)
  })

  test("should add 20 for portfolioUrl alone", () => {
    expect(
      calculateProfileCompleteness({ portfolioUrl: "https://dev.com", skillsCount: 0 }),
    ).toBe(20)
  })

  test("should add 20 only once for both githubUrl and portfolioUrl", () => {
    expect(
      calculateProfileCompleteness({
        githubUrl: "https://github.com/dev",
        portfolioUrl: "https://dev.com",
        skillsCount: 0,
      }),
    ).toBe(20)
  })

  test("should add 20 for skillsCount >= 3", () => {
    expect(calculateProfileCompleteness({ skillsCount: 3 })).toBe(20)
  })

  test("should not add points for skillsCount < 3", () => {
    expect(calculateProfileCompleteness({ skillsCount: 2 })).toBe(0)
  })

  test("should add 10 for studentNumber", () => {
    expect(calculateProfileCompleteness({ studentNumber: "STU-1", skillsCount: 0 })).toBe(10)
  })

  test("should add 10 for department", () => {
    expect(calculateProfileCompleteness({ department: "CS", skillsCount: 0 })).toBe(10)
  })

  test("should not count whitespace-only strings", () => {
    expect(
      calculateProfileCompleteness({
        bio: "   ",
        phone: "  ",
        githubUrl: "  ",
        portfolioUrl: "  ",
        studentNumber: "  ",
        department: "  ",
        skillsCount: 0,
      }),
    ).toBe(0)
  })

  test("should handle null values gracefully", () => {
    expect(
      calculateProfileCompleteness({
        bio: null,
        phone: null,
        wilayaCode: null,
        githubUrl: null,
        portfolioUrl: null,
        studentNumber: null,
        department: null,
        skillsCount: 0,
      }),
    ).toBe(0)
  })
})
