import { env } from "@/env"
import { generateOpenAPISpec } from "@/server/openapi/generator"

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not Found", { status: 404 })
  }

  const spec = await generateOpenAPISpec(env.NEXT_PUBLIC_BETTER_AUTH_URL)

  return Response.json(spec, {
    headers: {
      "Access-Control-Allow-Origin": new URL(env.NEXT_PUBLIC_BETTER_AUTH_URL)
        .origin,
    },
  })
}
