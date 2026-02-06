import { describe, test, expect } from "bun:test"
import { cn } from "./utils"

describe("cn utility function", () => {
  describe("basic class merging", () => {
    test("should merge multiple class names", () => {
      const result = cn("class1", "class2", "class3")
      expect(result).toBe("class1 class2 class3")
    })

    test("should handle single class", () => {
      const result = cn("single-class")
      expect(result).toBe("single-class")
    })

    test("should return empty string for no arguments", () => {
      const result = cn()
      expect(result).toBe("")
    })
  })

  describe("conditional classes", () => {
    test("should include class when condition is true", () => {
      const isActive = true
      const result = cn("base", isActive && "active")
      expect(result).toBe("base active")
    })

    test("should exclude class when condition is false", () => {
      const isActive = false
      const result = cn("base", isActive && "active")
      expect(result).toBe("base")
    })

    test("should handle multiple conditional classes", () => {
      const isPrimary = true
      const isLarge = false
      const isDisabled = true
      const result = cn(
        "btn",
        isPrimary && "btn-primary",
        isLarge && "btn-large",
        isDisabled && "btn-disabled"
      )
      expect(result).toBe("btn btn-primary btn-disabled")
    })
  })

  describe("tailwind class merging", () => {
    test("should merge conflicting tailwind classes (last wins)", () => {
      const result = cn("px-2 py-1", "px-4")
      expect(result).toBe("py-1 px-4")
    })

    test("should merge padding classes", () => {
      const result = cn("p-2", "p-4")
      expect(result).toBe("p-4")
    })

    test("should merge margin classes", () => {
      const result = cn("m-2", "m-4")
      expect(result).toBe("m-4")
    })

    test("should handle color classes", () => {
      const result = cn("text-red-500", "text-blue-500")
      expect(result).toBe("text-blue-500")
    })

    test("should merge flex-related classes", () => {
      const result = cn("flex", "flex-col", "items-start")
      expect(result).toBe("flex flex-col items-start")
    })
  })

  describe("array and object handling", () => {
    test("should handle array of classes", () => {
      const result = cn(["class1", "class2"])
      expect(result).toBe("class1 class2")
    })

    test("should handle object with boolean values", () => {
      const result = cn({ active: true, disabled: false, primary: true })
      expect(result).toBe("active primary")
    })

    test("should handle mixed arrays and objects", () => {
      const result = cn("base", ["class1", "class2"], { active: true })
      expect(result).toBe("base class1 class2 active")
    })
  })

  describe("null and undefined handling", () => {
    test("should filter out null values", () => {
      const result = cn("base", null, "class1", null)
      expect(result).toBe("base class1")
    })

    test("should filter out undefined values", () => {
      const result = cn("base", undefined, "class1", undefined)
      expect(result).toBe("base class1")
    })

    test("should filter out both null and undefined", () => {
      const maybeClass: string | null = null
      const result = cn("base", maybeClass, "class1")
      expect(result).toBe("base class1")
    })
  })

  describe("falsy values", () => {
    test("should filter out empty strings", () => {
      const result = cn("base", "", "class1")
      expect(result).toBe("base class1")
    })

    test("should filter out 0 and false", () => {
      const result = cn("base", 0 as unknown as string, false as unknown as string, "class1")
      expect(result).toBe("base class1")
    })
  })

  describe("complex real-world scenarios", () => {
    test("should handle button component classes", () => {
      // Use type assertion to prevent TypeScript from inferring literal types
      const variant: string = "primary"
      const size: string = "large"
      const isDisabled = false
      const isLoading = true

      const result = cn(
        "inline-flex items-center justify-center rounded-md font-medium",
        variant === "primary" && "bg-blue-500 text-white",
        variant === "secondary" && "bg-gray-200 text-gray-800",
        size === "small" && "px-3 py-1 text-sm",
        size === "large" && "px-6 py-3 text-lg",
        isDisabled && "opacity-50 cursor-not-allowed",
        isLoading && "cursor-wait"
      )

      expect(result).toBe(
        "inline-flex items-center justify-center rounded-md font-medium bg-blue-500 text-white px-6 py-3 text-lg cursor-wait"
      )
    })

    test("should handle responsive classes", () => {
      const result = cn(
        "grid",
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-3",
        "gap-4"
      )
      expect(result).toBe("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4")
    })

    test("should merge overlapping responsive classes", () => {
      const result = cn("px-2 md:px-4", "px-4 md:px-6")
      expect(result).toBe("px-4 md:px-6")
    })
  })

  describe("edge cases", () => {
    test("should handle deeply nested arrays", () => {
      const result = cn(["level1", ["level2", ["level3"]]])
      expect(result).toBe("level1 level2 level3")
    })

    test("should handle empty objects", () => {
      const result = cn("base", {})
      expect(result).toBe("base")
    })

    test("should handle empty arrays", () => {
      const result = cn("base", [])
      expect(result).toBe("base")
    })

    test("should handle important modifier alongside regular classes", () => {
      const result = cn("text-red-500", "!text-blue-500")
      // Note: !important modifier doesn't merge with regular classes
      // Both classes are preserved as they have different specificity
      expect(result).toBe("text-red-500 !text-blue-500")
    })

    test("should handle arbitrary values", () => {
      const result = cn("w-[100px]", "h-[50px]")
      expect(result).toBe("w-[100px] h-[50px]")
    })
  })
})
