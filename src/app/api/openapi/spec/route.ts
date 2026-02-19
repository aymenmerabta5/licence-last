import { env } from "@/env"
import { generateOpenAPISpec } from "@/server/openapi/generator"

export async function GET() {
  const spec = await generateOpenAPISpec(env.NEXT_PUBLIC_BETTER_AUTH_URL)

  return Response.json(spec, {
    headers: {
      "Access-Control-Allow-Origin": new URL(env.NEXT_PUBLIC_BETTER_AUTH_URL)
        .origin,
    },
  })
}
