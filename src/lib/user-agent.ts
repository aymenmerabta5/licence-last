export interface ParsedUserAgent {
  browser: string
  os: string
  device: "Desktop" | "Mobile" | "Tablet"
  display: string
}

const BROWSERS: [RegExp, string][] = [
  [/Edg(?:e|A)?\//, "Edge"],
  [/OPR\/|Opera\//, "Opera"],
  [/Chrome\//, "Chrome"],
  [/Firefox\//, "Firefox"],
  [/Safari\//, "Safari"],
]

const OS_PATTERNS: [RegExp, string][] = [
  [/Windows NT 10\.0/, "Windows"],
  [/Windows NT/, "Windows"],
  [/Mac OS X/, "macOS"],
  [/Android/, "Android"],
  [/iPhone|iPad/, "iOS"],
  [/Linux/, "Linux"],
  [/CrOS/, "Chrome OS"],
]

function detectBrowser(ua: string): string {
  for (const [pattern, name] of BROWSERS) {
    if (pattern.test(ua)) return name
  }
  return "Unknown Browser"
}

function detectOS(ua: string): string {
  for (const [pattern, name] of OS_PATTERNS) {
    if (pattern.test(ua)) return name
  }
  return "Unknown OS"
}

function detectDevice(ua: string): "Desktop" | "Mobile" | "Tablet" {
  if (/iPad|tablet/i.test(ua)) return "Tablet"
  if (/Mobile|Android|iPhone|iPod/i.test(ua)) return "Mobile"
  return "Desktop"
}

export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
  if (!ua) {
    return {
      browser: "Unknown Browser",
      os: "Unknown OS",
      device: "Desktop",
      display: "Unknown Device",
    }
  }

  const browser = detectBrowser(ua)
  const os = detectOS(ua)
  const device = detectDevice(ua)

  return {
    browser,
    os,
    device,
    display: `${browser} on ${os}`,
  }
}
