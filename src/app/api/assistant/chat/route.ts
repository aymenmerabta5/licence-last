import { isValidOrigin } from "@/lib/csrf"

export const maxDuration = 60

export async function POST(req: Request) {
  if (!isValidOrigin(req)) {
    return new Response("Forbidden: invalid origin", { status: 403 })
  }

  const { handleChatRequest } = await import("@/server/ai/chat-handler")
  return handleChatRequest(req)
}
