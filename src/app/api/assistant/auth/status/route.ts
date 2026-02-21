import Arcade from "@arcadeai/arcadejs"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

import { env } from "@/env"
import { auth } from "@/lib/auth"
import { isValidOrigin } from "@/lib/csrf"
import { checkRateLimit } from "@/server/ai/rate-limit"
import { db } from "@/server/db"
import { company, companyMember } from "@/server/db/schema/companies"

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

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  if (session.user.banned) {
    return new Response("Forbidden: account suspended", { status: 403 })
  }

  if (session.user.role !== "company_admin") {
    return new Response("Forbidden", { status: 403 })
  }

  if (session.user.onboardingCompleted) {
    const [membership] = await db
      .select({ status: company.status })
      .from(companyMember)
      .innerJoin(company, eq(companyMember.companyId, company.id))
      .where(eq(companyMember.userId, session.user.id))
      .limit(1)

    if (!membership || membership.status !== "approved") {
      return new Response("Forbidden", { status: 403 })
    }
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
    apiKey: env.ARCADE_API_KEY,
  })

  try {
    const authResponse = await arcade.tools.authorize({
      tool_name: body.toolName,
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
