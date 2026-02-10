import { headers } from "next/headers"

import Arcade from "@arcadeai/arcadejs"

import { env } from "@/env"
import { auth } from "@/lib/auth"
import { checkRateLimit } from "@/server/services/ai/rate-limit"

export async function POST(req: Request) {
  let body: { toolName?: unknown }
  try {
    body = (await req.json()) as { toolName?: unknown }
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  if (typeof body.toolName !== "string" || body.toolName.trim().length === 0) {
    return new Response("toolName is required", { status: 400 })
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  if (session.user.role !== "company_admin") {
    return new Response("Forbidden", { status: 403 })
  }

  const rl = checkRateLimit({
    key: session.user.id,
    limit: 60,
    windowMs: 60_000,
  })

  if (!rl.ok) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: {
        "retry-after": String(Math.ceil(rl.retryAfterMs / 1000)),
      },
    })
  }

  const arcade = new Arcade({
    apiKey: env.ARCADE_API_KEY,
  })

  const authResponse = await arcade.tools.authorize({
    tool_name: body.toolName,
    user_id: session.user.id,
  })

  return Response.json({
    status: authResponse.status ?? null,
    url: authResponse.url ?? null,
  })
}
