import "server-only"

import { OpenAPIGenerator } from "@orpc/openapi"
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4"
import { appRouter } from "@/server/orpc/router"

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
})

export async function generateOpenAPISpec(baseUrl: string) {
  return generator.generate(appRouter, {
    info: {
      title: "Stag API",
      version: "1.0.0",
      description:
        "Internship platform connecting companies with university students.",
    },
    servers: [{ url: `${baseUrl}/api/rpc`, description: "oRPC endpoint" }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Session cookie-based auth via Better Auth.",
        },
      },
    },
  })
}
