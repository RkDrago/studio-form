import { NextRequest, NextResponse } from "next/server";
import { buildKey, cdnUrlForKey, getS3Client, S3_BUCKET, uploadMode } from "@/lib/s3";

export const dynamic = "force-dynamic";

const ALLOWED = /^(image|video)\//;

/**
 * POST /api/media/presign
 * body: { fileName, fileType }
 * returns: { url, fields, cdnUrl, key, mode }
 *
 * s3 mode   -> a real presigned POST straight to the bucket
 * temp mode -> the local /api/upload endpoint (in-memory store)
 */
export async function POST(req: NextRequest) {
  let fileName = "";
  let fileType = "";
  try {
    const body = await req.json();
    fileName = String(body?.fileName ?? "");
    fileType = String(body?.fileType ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!fileName) {
    return NextResponse.json({ error: "fileName is required" }, { status: 400 });
  }
  if (!ALLOWED.test(fileType)) {
    return NextResponse.json(
      { error: "Only image/* and video/* uploads are allowed" },
      { status: 415 },
    );
  }

  const key = buildKey(fileName);

  if (uploadMode === "temp") {
    // No AWS credentials: hand the browser a local upload target instead.
    return NextResponse.json({
      url: "/api/upload",
      fields: { key, contentType: fileType },
      cdnUrl: "",
      key,
      mode: "temp" as const,
    });
  }

  const { createPresignedPost } = await import("@aws-sdk/s3-presigned-post");
  const post = await createPresignedPost(getS3Client(), {
    Bucket: S3_BUCKET,
    Key: key,
    Conditions: [
      ["content-length-range", 0, 524288000], // 500MB cap
      { "Content-Type": fileType },
    ],
    Fields: { "Content-Type": fileType },
    Expires: 600, // 10 minutes
  });

  return NextResponse.json({
    url: post.url,
    fields: post.fields,
    cdnUrl: cdnUrlForKey(key),
    key,
    mode: "s3" as const,
  });
}
