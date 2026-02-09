import "server-only"

import { env } from "@/env"

function isConfigured(): boolean {
  return !!(
    env.S3_BUCKET &&
    env.S3_ENDPOINT &&
    env.S3_ACCESS_KEY_ID &&
    env.S3_SECRET_ACCESS_KEY &&
    env.S3_PUBLIC_URL
  )
}

let client: InstanceType<typeof Bun.S3Client> | null = null

function getClient() {
  if (!isConfigured()) {
    throw new Error("S3 is not configured. Set S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_PUBLIC_URL.")
  }

  if (!client) {
    client = new Bun.S3Client({
      endpoint: env.S3_ENDPOINT!,
      accessKeyId: env.S3_ACCESS_KEY_ID!,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
      region: env.S3_REGION,
      bucket: env.S3_BUCKET!,
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
  await s3.write(key, data, { type: contentType })
  return `${env.S3_PUBLIC_URL!}/${key}`
}

/** Delete a file from S3. */
export async function deleteFile(key: string): Promise<void> {
  const s3 = getClient()
  await s3.file(key).delete()
}
