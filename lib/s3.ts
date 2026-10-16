import { S3Client } from "@aws-sdk/client-s3";

export const S3_BUCKET = process.env.S3_BUCKET ?? "";
export const CDN_URL = process.env.S3_CDN_URL ?? "";
export const AWS_REGION = process.env.AWS_REGION ?? "ap-south-1";

/**
 * The upload engine has two modes:
 *  - "s3"   : AWS credentials present -> real presigned POST straight to S3
 *  - "temp" : no credentials -> local in-memory blob store (lib/blobStore.ts)
 *
 * The client (lib/bulkUpload.ts) is mode-agnostic: it always POSTs the file to
 * whatever URL /api/media/presign returns.
 */
export const uploadMode: "s3" | "temp" =
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? "s3"
    : "temp";

let cached: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!cached) {
    cached = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return cached;
}

export function buildKey(fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, "-");
  return `projects/${Date.now()}-${safe}`;
}

export function cdnUrlForKey(key: string): string {
  return CDN_URL ? `${CDN_URL.replace(/\/$/, "")}/${key}` : key;
}
