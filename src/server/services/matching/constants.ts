export const MATCH_SCORING_VERSION = "v1.0.0"

export const MATCH_WEIGHT = {
  skills: 55,
  language: 20,
  location: 15,
  profile: 10,
} as const

export const PROFIENCY_RANK: Record<
  "a1" | "a2" | "b1" | "b2" | "c1" | "c2" | "native",
  number
> = {
  a1: 1,
  a2: 2,
  b1: 3,
  b2: 4,
  c1: 5,
  c2: 6,
  native: 7,
}

export const MATCH_FAIRNESS_NOTES = [
  "Location and language are soft signals, not hard filters.",
  "Score is one input and should be combined with profile review.",
  "Model prioritizes explicit requirements over demographic proxies.",
] as const
