import { NextRequest, NextResponse } from "next/server";
import { putBlob } from "@/lib/blobStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 500 * 1024 * 1024; // 500MB, matches the presign cap

/**
 * POST /api/upload  (multipart/form-data: key, contentType, file)
 *
 * The temp-mode stand-in for a direct-to-S3 POST. Stores bytes in memory and
 * returns a URL that /api/files/<id> serves back.
 */
export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file field is required" }, { status: 400 });
  }

  const contentType = String(form.get("contentType") || file.type || "");
  if (!/^(image|video)\//.test(contentType)) {
    return NextResponse.json(
      { error: "Only image/* and video/* uploads are allowed" },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 500MB cap" }, { status: 413 });
  }

  const key = String(form.get("key") || file.name);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const blob = putBlob({ key, contentType, bytes });

  return NextResponse.json(
    {
      id: blob.id,
      key: blob.key,
      size: blob.size,
      contentType: blob.contentType,
      url: `/api/files/${blob.id}`,
    },
    { status: 201 },
  );
}
