import { NextRequest, NextResponse } from "next/server";
import { getProjectById } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * POST /api/media/optimize
 * body: { projectId }
 *
 * Production runs this as a cron job: Sharp strips EXIF and generates WebP +
 * thumbnails (see docs/ARCHITECTURE.md). In the temp-data build it reports the
 * jobs that WOULD be queued so the endpoint contract stays real.
 */
export async function POST(req: NextRequest) {
  let projectId = "";
  try {
    const body = await req.json();
    projectId = String(body?.projectId ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const project = getProjectById(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const images = project.media.filter((m) => m.type === "IMAGE");

  return NextResponse.json(
    {
      accepted: true,
      mode: "temp",
      queued: images.length,
      note: "Sharp WebP + thumbnail generation is stubbed in the temp-data build; no bytes are rewritten.",
      targets: images.map((m) => ({ id: m.id, url: m.url })),
    },
    { status: 202 },
  );
}
