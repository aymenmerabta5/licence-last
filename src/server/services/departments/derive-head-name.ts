import "server-only"

const DEFAULT_HEAD_NAME = "Department Head"
const MAX_HEAD_NAME_LENGTH = 120

function toTitleCase(value: string) {
  return value
    .split(" ")
    .map((segment) => {
      if (!segment) return ""
      return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
    })
    .join(" ")
}

export function deriveHeadNameFromEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const localPart = normalizedEmail.split("@")[0] ?? ""

  const normalizedLocalPart = localPart
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!normalizedLocalPart) {
    return DEFAULT_HEAD_NAME
  }

  const titled = toTitleCase(normalizedLocalPart)
  if (!titled) {
    return DEFAULT_HEAD_NAME
  }

  return titled.slice(0, MAX_HEAD_NAME_LENGTH)
}
