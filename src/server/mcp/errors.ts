export class DevMcpError extends Error {
  public readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

export function toToolError(error: unknown): DevMcpError {
  if (error instanceof DevMcpError) {
    return error
  }

  if (error instanceof Error) {
    return new DevMcpError("INTERNAL_ERROR", error.message)
  }

  return new DevMcpError("INTERNAL_ERROR", "Unknown error")
}
