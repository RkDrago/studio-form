import { NextRequest, NextResponse } from "next/server";
import { getBlob } from "@/lib/blobStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/files/<id> - serve an uploaded temp blob. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const blob = getBlob(params.id);
  if (!blob) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new NextResponse(blob.bytes as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": blob.contentType,
      "Content-Length": String(blob.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
