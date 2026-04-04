import { getPublicAppUrl } from "@/lib/public-url"
import { generateOpenAPISpec } from "@/server/openapi/generator"

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not Found", { status: 404 })
  }

  const publicAppUrl = getPublicAppUrl()
  const spec = await generateOpenAPISpec(publicAppUrl)

  return Response.json(spec, {
    headers: {
      "Access-Control-Allow-Origin": new URL(publicAppUrl).origin,
    },
  })
}
