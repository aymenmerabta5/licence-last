import { env } from "@/env"

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not Found", { status: 404 })
  }

  const specUrl = `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/openapi/spec`

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Stag API Reference</title>
    <meta name="description" content="Interactive API documentation for the Stag platform." />
  </head>
  <body>
    <script id="api-reference" data-url="${specUrl}"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.28.12"></script>
  </body>
</html>`

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  })
}
