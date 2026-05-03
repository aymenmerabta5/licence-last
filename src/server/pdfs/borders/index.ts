import BorderClassic from "@/server/pdfs/borders/BorderClassic"
import BorderFormal from "@/server/pdfs/borders/BorderFormal"
import BorderMinimal from "@/server/pdfs/borders/BorderMinimal"
import BorderModern from "@/server/pdfs/borders/BorderModern"
import BorderOrnate from "@/server/pdfs/borders/BorderOrnate"
import BorderPremium from "@/server/pdfs/borders/BorderPremium"

export const borderComponents = {
  classic: BorderClassic,
  formal: BorderFormal,
  minimal: BorderMinimal,
  modern: BorderModern,
  ornate: BorderOrnate,
  premium: BorderPremium,
} as const

export type BorderStyleKey = keyof typeof borderComponents
