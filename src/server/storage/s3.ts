import "server-only"

import { env } from "@/env"

function isConfigured(): boolean {
  const bucket = env.S3_BUCKET ?? env.S3_BUCKET_NAME
  const endpoint = env.S3_ENDPOINT ?? env.NEXT_PUBLIC_S3_ENDPOINT
  const accessKeyId = env.S3_ACCESS_KEY_ID ?? env.AWS_ACCESS_KEY_ID
  const secretAccessKey = env.S3_SECRET_ACCESS_KEY ?? env.AWS_SECRET_ACCESS_KEY
  const publicUrl = env.S3_PUBLIC_URL ?? env.NEXT_PUBLIC_S3_URL

  return !!(
    bucket &&
    endpoint &&
    accessKeyId &&
    secretAccessKey &&
    publicUrl
  )
}

let client: InstanceType<typeof Bun.S3Client> | null = null

function getClient() {
  if (!isConfigured()) {
    throw new Error(
      "S3 is not configured. Set S3_PUBLIC_URL (or NEXT_PUBLIC_S3_URL) and either (S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY) or (S3_BUCKET_NAME, NEXT_PUBLIC_S3_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY).",
    )
  }

  // Bun's S3 API requires the Bun runtime. Avoid importing from "bun" so this
  // module can be loaded in Node-based Next.js environments without crashing.
  if (typeof Bun === "undefined" || !Bun.S3Client) {
    throw new Error("Bun runtime is required for S3 operations (Bun.S3Client is not available).")
  }

  if (!client) {
    const bucket = env.S3_BUCKET ?? env.S3_BUCKET_NAME
    const endpoint = env.S3_ENDPOINT ?? env.NEXT_PUBLIC_S3_ENDPOINT
    const accessKeyId = env.S3_ACCESS_KEY_ID ?? env.AWS_ACCESS_KEY_ID
    const secretAccessKey = env.S3_SECRET_ACCESS_KEY ?? env.AWS_SECRET_ACCESS_KEY

    if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "S3 is not configured. Missing bucket/endpoint/credentials after resolving env vars.",
      )
    }

    // Default to path-style (endpoint/bucket/key). This matches how Cloudflare R2
    // is commonly configured when the endpoint is the account-level hostname.
    // If the endpoint already includes the bucket as a subdomain, switch to
    // virtual-hosted-style (bucket.endpoint/key).
    let virtualHostedStyle = false
    try {
      const endpointUrl = new URL(endpoint)
      if (endpointUrl.host.startsWith(`${bucket}.`)) {
        virtualHostedStyle = true
      }
    } catch {
      // env schema should prevent this, but keep a safe default
    }

    client = new Bun.S3Client({
      endpoint,
      accessKeyId,
      secretAccessKey,
      region: env.S3_REGION,
      bucket,
      // virtualHostedStyle,
    })
  }

  return client
}

/** Upload a file to S3 and return the public URL. */
export async function uploadFile(
  key: string,
  data: Buffer,
  contentType: string,
): Promise<string> {
  const s3 = getClient()
  const publicUrl = env.S3_PUBLIC_URL ?? env.NEXT_PUBLIC_S3_URL
  if (!publicUrl) {
    throw new Error("S3 is not configured. Missing S3_PUBLIC_URL (or NEXT_PUBLIC_S3_URL).")
  }
  // Use s3.file(key).write() to properly pass content type options
  await s3.file(key).write(data, { type: contentType })
  return `${publicUrl}/${key}`
}

/** Delete a file from S3. */
export async function deleteFile(key: string): Promise<void> {
  const s3 = getClient()
  await s3.file(key).delete()
}
