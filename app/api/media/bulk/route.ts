import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addMedia } from "@/lib/data";

export const dynamic = "force-dynamic";

const BulkSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  urls: z
    .array(
      z.object({
        url: z.string().min(1),
        type: z.enum(["IMAGE", "VIDEO"]).optional(),
        size: z.number().int().nonnegative().optional(),
      }),
    )
    .min(1, "At least one url is required"),
});

/**
 * POST /api/media/bulk
 * body: { projectId, urls: [{ url, type?, size? }] }
 * Creates Media rows for a finished bulk upload and links them to a project.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const created = addMedia(parsed.data.projectId, parsed.data.urls);
  return NextResponse.json(
    { created: created.length, media: created },
    { status: 201 },
  );
}
