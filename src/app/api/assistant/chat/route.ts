import { isValidOrigin } from "@/lib/csrf"
import { handleChatRequest } from "@/server/ai/chat-handler"

export const maxDuration = 60

export async function POST(req: Request) {
  if (!isValidOrigin(req)) {
    return new Response("Forbidden: invalid origin", { status: 403 })
  }
  return handleChatRequest(req)
}
