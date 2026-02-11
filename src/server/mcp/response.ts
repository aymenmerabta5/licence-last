import type { DevMcpError } from "@/server/mcp/errors"

function normalizeStructuredContent(
  structuredContent: unknown,
): Record<string, unknown> {
  if (
    structuredContent !== null &&
    typeof structuredContent === "object" &&
    !Array.isArray(structuredContent)
  ) {
    return structuredContent as Record<string, unknown>
  }

  return {
    value: structuredContent,
  }
}

export function toolOk(structuredContent: unknown) {
  const normalized = normalizeStructuredContent(structuredContent)
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(normalized, null, 2),
      },
    ],
    structuredContent: normalized,
  }
}

export function toolError(error: DevMcpError) {
  return {
    content: [
      {
        type: "text" as const,
        text: `[${error.code}] ${error.message}`,
      },
    ],
    structuredContent: {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
      },
    },
    isError: true,
  }
}
