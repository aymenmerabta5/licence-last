import "server-only"

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { env } from "@/env"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("storage/s3")

function getConfig() {
  const bucket = env.S3_BUCKET ?? env.S3_BUCKET_NAME
  const endpoint = env.S3_ENDPOINT ?? env.NEXT_PUBLIC_S3_ENDPOINT
  const accessKeyId = env.S3_ACCESS_KEY_ID ?? env.AWS_ACCESS_KEY_ID
  const secretAccessKey = env.S3_SECRET_ACCESS_KEY ?? env.AWS_SECRET_ACCESS_KEY
  const publicUrl = env.S3_PUBLIC_URL ?? env.NEXT_PUBLIC_S3_URL

  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey || !publicUrl) {
    throw new Error(
      "S3 is not configured. Set S3_PUBLIC_URL (or NEXT_PUBLIC_S3_URL) and either (S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY) or (S3_BUCKET_NAME, NEXT_PUBLIC_S3_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY).",
    )
  }

  return { bucket, endpoint, accessKeyId, secretAccessKey, publicUrl }
}

let client: S3Client | null = null

function getClient() {
  if (!client) {
    const { endpoint, accessKeyId, secretAccessKey } = getConfig()

    client = new S3Client({
      endpoint,
      region: env.S3_REGION ?? "auto",
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    })
  }

  return client
}

export function isConfigured(): boolean {
  try {
    getConfig()
    return true
  } catch {
    return false
  }
}

export async function uploadFile(
  key: string,
  data: Buffer,
  contentType: string,
): Promise<string> {
  const s3 = getClient()
  const { bucket, publicUrl } = getConfig()

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      }),
    )
  } catch (err) {
    log.error({ err, key, contentType, size: data.length }, "S3 write failed")
    throw err
  }

  const cleanPublicUrl = publicUrl.replace(/\/+$/, "")
  return `${cleanPublicUrl}/${key}`
}

export async function deleteFile(key: string): Promise<void> {
  const s3 = getClient()
  const { bucket } = getConfig()

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  )
}

export async function getFile(key: string): Promise<Buffer> {
  const s3 = getClient()
  const { bucket } = getConfig()

  const response = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  )

  if (!response.Body) {
    throw new Error("S3 object has no body")
  }

  const chunks: Uint8Array[] = []
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)))
}
