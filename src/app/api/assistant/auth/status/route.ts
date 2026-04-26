import Arcade from "@arcadeai/arcadejs"
import { headers } from "next/headers"
import { isValidOrigin } from "@/lib/csrf"
import { checkRateLimit } from "@/server/ai/rate-limit"
import { getFreshAuthSession } from "@/server/auth/get-fresh-session"
import { getCompanyStatusByUserId } from "@/server/services/companies/get-status"

const ALLOWED_ARCADE_TOOL_NAME = /^(github|gmail)([._]|$)/i

function isCompanyAssistantEnabled() {
  const hasAiProviderConfig = Boolean(
    process.env.AI_API_KEY || process.env.POE_API_KEY,
  )
  const featureFlagDefault =
    process.env.ARCADE_API_KEY && hasAiProviderConfig ? "true" : "false"
  const featureFlag =
    process.env.FEATURE_COMPANY_ASSISTANT ?? featureFlagDefault

  return (
    featureFlag === "true" &&
    Boolean(process.env.ARCADE_API_KEY) &&
    hasAiProviderConfig
  )
}

export async function POST(req: Request) {
  if (!isValidOrigin(req)) {
    return new Response("Forbidden: invalid origin", { status: 403 })
  }

  let body: { toolName?: unknown }
  try {
    body = (await req.json()) as { toolName?: unknown }
  } catch {
    return new Response("Invalid JSON", { status: 400 })
  }

  if (typeof body.toolName !== "string" || body.toolName.trim().length === 0) {
    return new Response("toolName is required", { status: 400 })
  }

  const toolName = body.toolName.trim()

  if (!ALLOWED_ARCADE_TOOL_NAME.test(toolName)) {
    return new Response("Forbidden", { status: 403 })
  }

  const session = await getFreshAuthSession(await headers())

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  if (session.user.banned) {
    return new Response("Forbidden: account suspended", { status: 403 })
  }

  if (session.user.role !== "company_admin") {
    return new Response("Forbidden", { status: 403 })
  }

  if (!isCompanyAssistantEnabled()) {
    return new Response("Assistant integrations are disabled.", { status: 503 })
  }

  const company = await getCompanyStatusByUserId(session.user.id)
  if (!company || company.status !== "approved") {
    return new Response("Forbidden", { status: 403 })
  }

  const rl = await checkRateLimit({
    key: `assistant:auth:${session.user.id}`,
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
    apiKey: process.env.ARCADE_API_KEY!,
  })

  try {
    const authResponse = await arcade.tools.authorize({
      tool_name: toolName,
      user_id: session.user.id,
    })

    return Response.json({
      status: authResponse.status ?? null,
      url: authResponse.url ?? null,
    })
  } catch {
    return new Response(
      "Authorization provider is temporarily unavailable. Please try again.",
      { status: 502 },
    )
  }
}
